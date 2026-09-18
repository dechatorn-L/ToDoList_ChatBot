import { Task, Priority } from '../hooks/useTasks';
import { AISettings } from './aiSettings';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  actions?: string[];
}

export interface ToolActionHandler {
  createTask: (title: string, priority?: Priority, dueDate?: string) => void;
  updateTask: (
    id: string,
    updates: Partial<{
      title: string;
      priority: Priority;
      dueDate?: string;
      completed: boolean;
    }>
  ) => void;
  deleteTask: (id: string) => void;
  clearCompleted: () => void;
}

export function buildSystemPrompt(tasks: Task[]): string {
  const today = new Date().toLocaleDateString('en-CA');
  const snapshot = JSON.stringify(
    tasks.map((t) => ({
      id: t.id,
      title: t.title,
      completed: t.completed,
      priority: t.priority,
      dueDate: t.dueDate || null,
    })),
    null,
    2
  );

  return `You are an intelligent, friendly AI Companion for a Todolist productivity app.
Today's local date is ${today}.

## Active Tasks Snapshot:
${snapshot}

## Instructions:
1. Always use the provided tool functions whenever the user asks to add, complete, update, delete, or clear tasks.
2. To complete a task, call update_task with completed=true and the matching task id from the snapshot.
3. If the user refers to tasks by title, number, or relative terms (e.g. "finish the groceries task", "the first task"), look up the exact id in the Active Tasks Snapshot.
4. Keep your replies concise, helpful, and supportive.
5. If the user asks for guidance or advice (e.g. "what should I do next?"), analyze the tasks, deadlines, and priorities from the snapshot and provide actionable suggestions.`;
}

export function executeToolCall(
  name: string,
  args: Record<string, any>,
  handlers: ToolActionHandler
): { actionName: string; summary: string } {
  switch (name) {
    case 'create_task': {
      const { title, priority, dueDate } = args;
      handlers.createTask(title, priority, dueDate);
      return {
        actionName: 'create_task',
        summary: `Created task: ${title}${priority ? ` [${priority}]` : ''}`,
      };
    }
    case 'update_task': {
      const { id, title, priority, dueDate, completed } = args;
      handlers.updateTask(id, { title, priority, dueDate, completed });
      const changes: string[] = [];
      if (completed !== undefined) changes.push(completed ? 'completed' : 'active');
      if (title) changes.push(`renamed to "${title}"`);
      if (priority) changes.push(`priority: ${priority}`);
      if (dueDate) changes.push(`due: ${dueDate}`);
      return {
        actionName: 'update_task',
        summary: `Updated task: ${id}${changes.length > 0 ? ` (${changes.join(', ')})` : ''}`,
      };
    }
    case 'delete_task': {
      const { id } = args;
      handlers.deleteTask(id);
      return {
        actionName: 'delete_task',
        summary: `Deleted task: ${id}`,
      };
    }
    case 'clear_completed_tasks': {
      handlers.clearCompleted();
      return {
        actionName: 'clear_completed_tasks',
        summary: 'Cleared completed tasks',
      };
    }
    default:
      return {
        actionName: name,
        summary: `Executed unknown action: ${name}`,
      };
  }
}

const TOOL_DEFINITIONS_OPENAI = [
  {
    type: 'function',
    function: {
      name: 'create_task',
      description: 'Create a new todo task on the board',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Title or description of the task' },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
            description: 'Task priority level',
          },
          dueDate: {
            type: 'string',
            description: 'Optional due date in YYYY-MM-DD format',
          },
        },
        required: ['title'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_task',
      description: 'Update an existing task (status, title, priority, dueDate)',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Unique task id from the active tasks snapshot' },
          title: { type: 'string', description: 'Updated title' },
          completed: { type: 'boolean', description: 'True to mark complete, false for active' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          dueDate: { type: 'string', description: 'Due date in YYYY-MM-DD format' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_task',
      description: 'Delete a task from the board permanently',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Unique task id to remove' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'clear_completed_tasks',
      description: 'Remove all finished/completed tasks from the board',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
];

const TOOL_DEFINITIONS_GEMINI = [
  {
    function_declarations: [
      {
        name: 'create_task',
        description: 'Create a new todo task on the board',
        parameters: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING', description: 'Title or description of the task' },
            priority: {
              type: 'STRING',
              enum: ['low', 'medium', 'high'],
              description: 'Task priority level',
            },
            dueDate: {
              type: 'STRING',
              description: 'Optional due date in YYYY-MM-DD format',
            },
          },
          required: ['title'],
        },
      },
      {
        name: 'update_task',
        description: 'Update an existing task (status, title, priority, dueDate)',
        parameters: {
          type: 'OBJECT',
          properties: {
            id: { type: 'STRING', description: 'Unique task id from the snapshot' },
            title: { type: 'STRING', description: 'Updated title' },
            completed: { type: 'BOOLEAN', description: 'True to mark complete, false for active' },
            priority: { type: 'STRING', enum: ['low', 'medium', 'high'] },
            dueDate: { type: 'STRING', description: 'Due date in YYYY-MM-DD format' },
          },
          required: ['id'],
        },
      },
      {
        name: 'delete_task',
        description: 'Delete a task from the board permanently',
        parameters: {
          type: 'OBJECT',
          properties: {
            id: { type: 'STRING', description: 'Unique task id to remove' },
          },
          required: ['id'],
        },
      },
      {
        name: 'clear_completed_tasks',
        description: 'Remove all finished/completed tasks from the board',
        parameters: {
          type: 'OBJECT',
          properties: {},
        },
      },
    ],
  },
];

export async function sendChatMessage(
  messages: ChatMessage[],
  tasks: Task[],
  settings: AISettings,
  handlers: ToolActionHandler
): Promise<{ reply: string; performedActions: string[] }> {
  const isGemini = settings.provider === 'gemini';
  const key = (isGemini ? settings.geminiKey : settings.openaiKey)?.trim();

  if (!key) {
    return {
      reply: 'API key is missing. Please configure your API key in Settings.',
      performedActions: [],
    };
  }

  const systemPrompt = buildSystemPrompt(tasks);
  const performedActions: string[] = [];

  try {
    if (isGemini) {
      const model = settings.geminiModel || 'gemini-2.0-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

      const geminiContents = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const body = {
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: geminiContents,
        tools: TOOL_DEFINITIONS_GEMINI,
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || `Gemini API error (${res.status})`);
      }

      const candidate = data.candidates?.[0];
      const parts = candidate?.content?.parts || [];
      let replyText = '';

      for (const part of parts) {
        if (part.functionCall) {
          const { name, args } = part.functionCall;
          const result = executeToolCall(name, args || {}, handlers);
          performedActions.push(result.summary);
        }
        if (part.text) {
          replyText += part.text;
        }
      }

      if (!replyText.trim() && performedActions.length > 0) {
        replyText = `Done! ${performedActions.join('. ')}`;
      }

      return {
        reply: replyText.trim() || 'No response received.',
        performedActions,
      };
    } else {
      // OpenAI
      const model = settings.openaiModel || 'gpt-4o-mini';
      const url = 'https://api.openai.com/v1/chat/completions';

      const openAiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ];

      const body = {
        model,
        messages: openAiMessages,
        tools: TOOL_DEFINITIONS_OPENAI,
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || `OpenAI API error (${res.status})`);
      }

      const choice = data.choices?.[0];
      const message = choice?.message;
      let replyText = message?.content || '';

      if (message?.tool_calls) {
        for (const call of message.tool_calls) {
          if (call.function) {
            let args: Record<string, any> = {};
            try {
              args = JSON.parse(call.function.arguments || '{}');
            } catch {
              // fallback
            }
            const result = executeToolCall(call.function.name, args, handlers);
            performedActions.push(result.summary);
          }
        }
      }

      if (!replyText.trim() && performedActions.length > 0) {
        replyText = `Done! ${performedActions.join('. ')}`;
      }

      return {
        reply: replyText.trim() || 'No response received.',
        performedActions,
      };
    }
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Failed to communicate with AI provider.';
    return {
      reply: `Error: ${errMsg}`,
      performedActions,
    };
  }
}

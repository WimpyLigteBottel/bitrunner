import { NS } from "@ns";
import { Task, TASK_NAME } from "./models/Models";


interface TaskExecution {
  name: string;
  start: number;
  end: number;
}


export function simulateBatchTimes(tasks: Task[], scale: number = 0.05): string {
  // Remove duplicate tasks by name (keep first occurrence)
  const uniqueTasks = tasks.filter((task, index, self) =>
    index === self.findIndex(t => t.name === task.name)
  );

  // Calculate execution windows for each task
  const executions: TaskExecution[] = uniqueTasks.map(task => ({
    name: task.name,
    start: task.delay,
    end: task.delay + task.time
  }));

  // Sort by name for consistent output
  executions.sort((a, b) => a.name.localeCompare(b.name));

  // Find the maximum end time to determine timeline length
  const maxTime = Math.max(...executions.map(e => e.end));

  // Create visualization
  const lines: string[] = [];

  executions.forEach(exec => {
    const { name, start, end } = exec;

    // Build the visualization line
    let line = `${name.padEnd(2)} `;

    // Add spaces for delay (scaled)
    const scaledStart = Math.round(start * scale);
    line += ' '.repeat(scaledStart);

    // Add equals signs for execution time (scaled)
    const duration = end - start;
    const scaledDuration = Math.max(1, Math.round(duration * scale));
    line += '='.repeat(scaledDuration);

    // Add pipe at the end
    line += '|';

    lines.push(line);
  });

  // Add a timeline ruler at the bottom
  const scaledMaxTime = Math.round(maxTime * scale);
  const ruler = '   ' + Array.from({ length: scaledMaxTime + 1 }, (_, i) => {
    const actualTime = Math.round(i / scale);
    return i % Math.max(1, Math.round(5 * scale)) === 0 ? String(actualTime).slice(-1) : ' ';
  }).join('');
  lines.push('');
  lines.push(ruler);

  return lines.join('\n');
}

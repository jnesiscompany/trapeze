import { Command } from 'commander';
import { loadContext, setArguments } from './ctx';
import { logger } from './util/log';
import { wrapAction } from './util/cli';

export async function run() {
  try {
    const ctx = await loadContext();
    runProgram(ctx);
  } catch (e) {
    process.exitCode = 1;
    logger.error(e.message ? e.message : String(e));
    throw e;
  }
}

export function runProgram(ctx) {
  // program.version(env.package.version);
  const program = new Command();

  program
    .command('run [configFile]')
    .description(`Run project modification`)
    .option('--dry-run', 'Show changes before making them')
    .option('-y', 'Non-interactive')
    .option('--verbose', 'Verbose output')
    .action(
      wrapAction(async (configFile, args = {}) => {
        setArguments(ctx, args);

        const { runCommand } = await import('./tasks/run');
        await runCommand(ctx, configFile);
      }),
    );

  program.arguments('[command]').action(
    wrapAction(_ => {
      program.outputHelp();
    }),
  );

  program.parse(process.argv);
}
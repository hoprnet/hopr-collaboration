import clear from 'clear';
import chalk from 'chalk';
import figlet from 'figlet';

clear();
console.log(
  chalk.green(
    figlet.textSync('Chain on a Chip', { horizontalLayout: 'full' })
  )
);
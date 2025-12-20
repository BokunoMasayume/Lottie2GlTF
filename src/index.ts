import { Command, Option } from 'commander';
import path from 'path';
import fs from 'fs';
import { Lottie2Gltf } from './main';

const program = new Command();

program.version('0.0.0');

program.argument('<inputPath>', 'input lottie .json path')
    .option('-o, --outDir <string>', 'output directory')
    .action((inputPath, { outDir}) => {
        const dstName = path.basename(inputPath, '.json') + '.gltf';
        const dstBinName = path.basename(inputPath, '.json') + '.bin';
        const dstPath = outDir ?? path.join(inputPath, '../' + dstName);
        const dstBinPath = path.join(dstPath, '../' + dstBinName);

        const lottieJson = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

        Lottie2Gltf(lottieJson);
        
    });

program.parse();
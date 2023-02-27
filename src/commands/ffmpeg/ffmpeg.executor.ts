import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { CommandExecutor } from '../../core/executor/command.executor.js';
import { IStreamLogger } from '../../core/handlers/stream-logger.interface.js';
import { ICommandExecFfmpeg, IFfmpegInput } from './ffmpeg.types.js';
import { FileService } from '../../core/files/file.service.js';
import { PromptService } from '../../core/prompt/prompt.service.js';
import { FfmpegBuilder } from './ffmpeg.builder.js';
import { StreamHandler } from '../../core/handlers/stream.handler.js';

export class FfmpegExecutor extends CommandExecutor<IFfmpegInput>{
    private fileService: FileService = new FileService();
    private promptService: PromptService = new PromptService();

    constructor(logger: IStreamLogger) {
        super(logger);
    }


    protected build({ path, name, height, width }: IFfmpegInput): ICommandExecFfmpeg {
       const output = this.fileService.getFilePath(path, name, 'mp4');
       const args = new FfmpegBuilder()
           .input(path)
           .setVideoSize(width, height)
           .output(output);
       return { command: 'ffmpeg', args, output };
    }

    protected processStream(stream: ChildProcessWithoutNullStreams, logger: IStreamLogger): void {
        const handler = new StreamHandler(logger);
        handler.processOutput(stream);
    }

    protected async prompt(): Promise<IFfmpegInput> {
        const width = await this.promptService.input<number>('Ширина', 'number');
        const height = await this.promptService.input<number>('Высота', 'number');
        const path = await this.promptService.input<string>('Путь до файла', 'input');
        const name = await this.promptService.input<string>('Имя', 'input');
        return { width, path, height, name };
    }

    protected spawn({ output, command, args }: ICommandExecFfmpeg): ChildProcessWithoutNullStreams {
       this.fileService.deleteExistsFile(output);
       return spawn(command, args);
    }
}

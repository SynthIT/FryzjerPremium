import { mkdir } from "fs/promises";
import {
    access,
    appendFile,
    constants,
    copyFileSync,
    readFileSync,
    rm,
    stat,
    writeFileSync,
} from "fs";
import pathing from "path";

export interface IFLogServiceConf {
    kind: "log" | "error" | "warn" | "backup";
    position: "api" | "admin" | "front";
    http: string;
    path: string;
    force?: boolean;
    operation?: string;
    payload?: string;
}

const config = {
    log: pathing.join(process.cwd(), "logs", "log.log"),
    error: pathing.join(process.cwd(), "logs", "error.log"),
    warn: pathing.join(process.cwd(), "logs", "warn.log"),
    backup: "",
} as const;

const configExtra = {
    backup: (operation: string) =>
        pathing.join(
            process.cwd(),
            "logs",
            "backup",
            `${operation}-${new Date(Date.now()).getDate}-backup.backup.json`
        ),
} as const;

export interface IFLogService {
    file: string;
    prefix: string;
    http: string;
    path: string;
    backupContent?: string;
    log(mesage: string): void;
    error(message: string): void;
    backup(content: string): void;
}
/**
 * @constructor
 * @param kind to masz autofill
 * @param position też autofill, wybierz jedynie z opcji
 * @param force nie zaimplementowany bo po co
 * @param operation i piętro niżej
 * @param payload jedynie jak kind = "backup"
 * @method log
 * @method error  obydwa tak samo działa, ale imersyjnie łączyć z kind
 */
export class LogService implements IFLogService {
    file: string;
    prefix: string;
    http: string;
    path: string;
    backupContent?: string;
    constructor(conf: IFLogServiceConf) {
        if (conf.kind === "backup" && conf.operation) {
            const file = configExtra.backup(conf.operation);
            this.backupContent = conf.payload;
            this.file = file;
        } else {
            this.file = config[conf.kind];
        }
        this.path = conf.path;
        this.http = conf.http;
        this.prefix = conf.position;
        return this;
    }

    private changeExistingLog(file = this.file) {
        const DAY = 24 * 60 * 60 * 1000;
        access(file, constants.F_OK, (err) => {
            if (err) return;
            stat(file, (err, stats) => {
                if (err) throw err;
                if (Date.now() - stats.birthtimeMs >= DAY) {
                    copyFileSync(
                        this.file,
                        pathing.join(
                            process.cwd(),
                            "logs",
                            `${new Date(stats.birthtimeMs)
                                .toISOString()
                                .slice(0, 10)}-log.log`
                        )
                    );
                    rm(this.file, (err) => {
                        if (err) throw err;
                    });
                    appendFile(this.file, "", (err) => {
                        if (err) throw err;
                    });
                }
            });
        });
    }

    async log(message: string) {
        await mkdir(pathing.join(process.cwd(), "logs"), { recursive: true });
        console.log("ok");
        this.changeExistingLog();
        console.log("ok");

        access(this.file, (err) => {
            if (err) {
                appendFile(this.file, "", (err) => {
                    if (err) throw err;
                });

                const info = `${this.http} | ${this.prefix} | ${
                    this.path
                } | ${new Date(Date.now()).toISOString()} ${message}`;
                writeFileSync(this.file, info);
            } else {
                const info = `${readFileSync(this.file)}\n${this.http} | ${
                    this.prefix
                } | ${this.path} | ${new Date(
                    Date.now()
                ).toISOString()} ${message}`;
                writeFileSync(this.file, info);
            }
        });
    }

    async error(message: string) {
        await mkdir(pathing.join(process.cwd(), "logs"), { recursive: true });

        this.changeExistingLog();
        access(this.file, (err) => {
            if (err) {
                appendFile(this.file, "", (err) => {
                    if (err) throw err;
                });

                const info = `${this.http} | ${this.prefix} | ${
                    this.path
                } | ${new Date(Date.now()).toISOString()} ${message}`;
                writeFileSync(this.file, info);
            } else {
                const info = `${readFileSync(this.file)}\n${this.http} | ${
                    this.prefix
                } | ${this.path} | ${new Date(
                    Date.now()
                ).toISOString()} ${message}`;
                writeFileSync(this.file, info);
            }
        });
    }

    /**
     *
     * @param content zostaw puste, no chyba że masz coś lepszego do zaproponowania
     */

    async backup(content = this.backupContent) {
        await mkdir(pathing.join(process.cwd(), "logs", "backup"), {
            recursive: true,
        });
        appendFile(this.file, "", (err) => {
            if (err) throw err;
        });
        writeFileSync(this.file, `${content}`);
    }
}

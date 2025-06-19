/*
 *  Copyright 2025 Curity AB
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */


/*
 * A simple API error object
 */
export class ApiError extends Error {

    public readonly status: number;
    public readonly code: string;
    public readonly extra: any;

    public constructor(status: number, code: string, message: string, extra: any = null) {
        super(message);
        this.status = status;
        this.code = code;
        this.extra = extra;
    }

    public toClientObject(): any {

        return {
            code: this.code,
            message: this.message,
        }
    }

    public toLogObject(): any {

        const data: any = {
            status: this.status,
            code: this.code,
            message: this.message,
        }

        if (this.extra) {
            data.extra = this.extra;
        }

        return data;
    }
}
/// <reference types="node" />
import { ServerResponse } from 'http';
import ApiRequest from '../types/api-request';
export default function createHandler(): (req: ApiRequest, res: ServerResponse) => Promise<void>;

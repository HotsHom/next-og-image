/// <reference types="node" />
import Props from '../types/props';
export default function getImage(baseUrl: string, path: string[], props: Props): Promise<Buffer | String | void>;

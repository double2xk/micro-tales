import {nanoid} from "nanoid";

export const generateEditToken = (prefix = "edit") => `${prefix}_${nanoid(24)}`;

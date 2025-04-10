import {nanoid} from "nanoid";

export const generateEditToken = () => `edit_${nanoid(24)}`;

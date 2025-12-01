import { Param, ParseUUIDPipe } from '@nestjs/common';

export function ParamUUID(param = 'id') {
  return Param(param, new ParseUUIDPipe());
}

import { convertNumToStr } from './convertNumToStr';
import { ICallsign } from './generateCallsign';

export function convertCallsignToSpoken(callsign: ICallsign): string {
  const carrierName = callsign.carrier;
  const spokenNumber = convertNumToStr(callsign.number);
  return `${carrierName} ${spokenNumber}`;
}

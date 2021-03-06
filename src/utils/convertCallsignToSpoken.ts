import { convertNumToText } from './convertNumToText';
import { IPlaneCallsign } from './generateCallsign';

export function convertCallsignToSpoken(callsign: IPlaneCallsign): string {
  const carrierName = callsign.carrier.spoken;
  const spokenNumber = convertNumToText(callsign.number);
  return `${carrierName} ${spokenNumber}`;
}

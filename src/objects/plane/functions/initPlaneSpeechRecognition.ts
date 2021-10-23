import { PilotPhrases } from '../../../types/PilotPhrases';
import { PlaneCarriersSpoken } from '../../../types/PlaneCarriers';
import { convertNumToText } from '../../../utils/convertNumToText';
import { Plane } from '../Plane';

/* --------------------- Init Speech Recognition -------------------- */
export function initPlaneSpeechRecognition(plane: Plane) {
  const speech = plane.playerSpeech;
  function talk(phrase: string) {
    plane.pilotSpeech.talk(phrase);
  }
  if ('webkitSpeechRecognition' in window) {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const startSpeechRecognition = () => {
      speech.init = new SpeechRecognition();

      speech.init.onresult = (event: any) => {
        const transcript: string = event.results[0][0].transcript;
        const words = transcript.toLowerCase().split(' ');
        if (words.length > 0) speech.text = words;
        console.log(speech.text);

        if (speech.text.length > 0) {
          // Get PLANE CALLSIGN
          const endOfCallsignIdx = getEndOfCallsignIdx(speech.text);
          const callsignArr = speech.text.slice(0, endOfCallsignIdx);
          const carrierName = callsignArr
            .slice(0, callsignArr.length - 1)
            .join(' ');
          const carrierNum = callsignArr[callsignArr.length - 1];
          const callsign = {
            carrier: carrierName,
            number: Number(carrierNum),
            full: `${PlaneCarriersSpoken[carrierName]}${carrierNum}`,
          };
          console.log('Callsign:', callsign.full);

          // Get HEADING
          const headingPrefixIdx = speech.text.indexOf('heading');
          const headingStr = speech.text[headingPrefixIdx + 1];
          const headingNum = Number(headingStr);

          // Get TURN
          const turnPrefixIdx = speech.text.indexOf('turn');
          const turnStr = speech.text[turnPrefixIdx + 1];
          if (turnStr === 'left') plane.move.turnTo = 'Left';
          if (turnStr === 'right') plane.move.turnTo = 'Right';

          if (isNaN(headingNum)) {
            talk(PilotPhrases.SayAgain);
          } else if (headingNum < 1 || headingNum > 360) {
            talk(PilotPhrases.SayAgain);
          } else {
            setTimeout(() => {
              const spokenHeading = convertNumToText(headingStr);
              talk(`${PilotPhrases.Roger}, heading ${spokenHeading}`);
              plane.move.newHeading = headingNum;
            }, 500);
          }
        }
      };

      speech.init.onstart = () => {
        console.log('LISTENING...');
        speech.isActive = true;
      };

      speech.init.onend = () => {
        console.log('SPEECH STOPPED');
        speech.isActive = false;
      };

      speech.init.onerror = () => {
        console.error('SPEECH ERROR');
      };
    };
    try {
      startSpeechRecognition();
    } catch (err) {
      console.error(err);
    }
  } else {
    alert(
      `Your browser doesn't support Speech Recognition. Use the latest Chrome.`
    );
  }
}

function getEndOfCallsignIdx(words: string[]): number | undefined {
  let endOfCallsignIdx: number | undefined = undefined;
  let currentIdx = 0;
  let foundEndOfCallsign = false;
  let wordsLen = words.length;

  do {
    const word = words[currentIdx];
    if (word === 'turn' || word === 'squawk') {
      foundEndOfCallsign = true;
      endOfCallsignIdx = currentIdx;
    } else currentIdx++;
  } while (!foundEndOfCallsign && currentIdx < wordsLen);

  return endOfCallsignIdx;
}

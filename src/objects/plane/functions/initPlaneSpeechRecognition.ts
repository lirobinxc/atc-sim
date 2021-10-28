import { planeConfig } from '../../../config/PlaneConfig';
import { RadarScene } from '../../../scenes/RadarScene';
import { PilotPhrases } from '../../../types/PilotPhrases';
import {
  PlaneCarriersAuthenticSpoken,
  PlaneCarriersCasualSpoken,
} from '../../../types/PlaneCarriers';
import { convertNumToText } from '../../../utils/convertNumToText';
import { CallsignType } from '../../../utils/generateCallsign';
import { Plane } from '../Plane';
import { grammar } from './grammar';

/* --------------------- Init Speech Recognition -------------------- */
export function initPlaneSpeechRecognition(scene: RadarScene, planes: Plane[]) {
  function talk(plane: Plane, phrase: string) {
    if (!plane) return;

    plane.pilotSpeech.talk(phrase);
  }

  if ('webkitSpeechRecognition' in window) {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const SpeechGrammarList =
      (window as any).SpeechGrammarList ||
      (window as any).webkitSpeechGrammarList;
    const startSpeechRecognition = () => {
      scene.speech = new SpeechRecognition();
      const speech = scene.speech;

      //Setup Speech Options
      speech.lang = 'en-US';

      // Setup Grammar
      let speechRecognitionList = new SpeechGrammarList();
      speechRecognitionList.addFromString(grammar);
      speech.grammars = speechRecognitionList;

      speech.onresult = (event: any) => {
        const transcript: string = event.results[0][0].transcript;
        const words = transcript.toLowerCase().split(' ');
        if (words.length <= 0) return console.log('No words detected.');
        console.log(words);

        if (words.length > 0) {
          // Get PLANE CALLSIGN
          const endOfCallsignIdx = getEndOfCallsignIdx(words);
          if (!endOfCallsignIdx) return;

          const callsignArr = words.slice(0, endOfCallsignIdx);

          const carrierNameArr = callsignArr.slice(0, callsignArr.length - 1);
          const carrierName = carrierNameArr.join(' ');

          const carrierNum = Number(callsignArr[callsignArr.length - 1]);

          const speechCallsign = {
            carrier: carrierName,
            number: Number(carrierNum),
            full: `${PlaneCarriersAuthenticSpoken[carrierName]}${carrierNum}`,
          };
          if (planeConfig.plane.CALLSIGN_TYPE === CallsignType.Casual) {
            speechCallsign.full = `${PlaneCarriersCasualSpoken[carrierName]}${carrierNum}`;
          }

          console.log('Callsign:', speechCallsign.full);
          let plane = planes.find(
            (plane) => plane.callsign.full === speechCallsign.full
          );

          if (!plane) {
            console.log('NO ACTIVE CALLSIGN DETECTED');
            speech.stop();
            return;
          }

          // Get HEADING
          const headingPrefixIdx = words.indexOf('heading');
          const headingStr = words[headingPrefixIdx + 1];
          const headingNum = Number(headingStr);

          // Get TURN
          const turnPrefixIdx = words.indexOf('turn');
          const turnStr = words[turnPrefixIdx + 1];
          if (turnStr === 'left') plane.move.turnTo = 'Left';
          if (turnStr === 'right') plane.move.turnTo = 'Right';

          if (isNaN(headingNum)) {
            talk(plane, PilotPhrases.SayAgain);
          } else if (headingNum < 1 || headingNum > 360) {
            talk(plane, PilotPhrases.SayAgain);
          } else {
            setTimeout(() => {
              if (!plane) return;

              const spokenHeading = convertNumToText(headingStr);
              talk(plane, `${PilotPhrases.Roger}, heading ${spokenHeading}`);
              plane.move.newHeading = headingNum;
            }, 500);
          }
        }
      };

      speech.onstart = () => {
        scene.speechIsActive = true;
        console.log('LISTENING...');
      };

      speech.onend = () => {
        scene.speechIsActive = false;
        console.log('SPEECH STOPPED');
      };

      speech.onerror = () => {
        scene.speechIsActive = false;
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

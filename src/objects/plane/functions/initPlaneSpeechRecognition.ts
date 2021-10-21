import type { PlaneSymbol } from '../components/PlaneSymbol';
import { IPlaneSpeech } from '../PlaneObjOld';

/* --------------------- Init Speech Recognition -------------------- */
export function initPlaneSpeechRecogntion(
  speech: IPlaneSpeech,
  planeSymbol: PlaneSymbol
) {
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
          const callsign = speech.text.slice();

          // Get HEADING
          const headingPrefixIdx = speech.text.indexOf('heading');
          const headingStr = speech.text[headingPrefixIdx + 1];
          const headingNum = Number(headingStr);

          // Get TURN
          const turnPrefixIdx = speech.text.indexOf('turn');
          const turnStr = speech.text[turnPrefixIdx + 1];
          if (turnStr === 'left') planeSymbol.turnTo = 'Left';
          if (turnStr === 'right') planeSymbol.turnTo = 'Right';

          if (isNaN(headingNum)) {
            // this.setPlaneTalk(this.PilotPhrases.SayAgain);
          } else if (headingNum < 1 || headingNum > 360) {
            // this.setPlaneTalk(this.PilotPhrases.SayAgain);
          } else {
            setTimeout(() => {
              // const spokenHeading = convertNumToStr(headingStr);
              // this.setPlaneTalk(
              //   `${this.PilotPhrases.Roger}, heading ${spokenHeading}`
              // );
              planeSymbol.newHeading = headingNum;
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

function getEndOfCallsignIdx(words: string[]): number | null {
  let endOfCallsignIdx: number | null = null;
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

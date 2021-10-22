import { PilotPhrases } from '../../../types/PilotPhrases';
import { convertNumToText } from '../../../utils/convertNumToText';
import { Plane } from '../Plane';

/* --------------------- Init Speech Recognition -------------------- */
export class PlaneSpeechRecogntion {
  public init: any;
  public selectedPlane: Plane;
  public isActive: boolean;

  constructor(plane: Plane) {
    this.selectedPlane = plane;
    this.isActive = false;

    try {
      this.initSpeechRecognition();
    } catch (err) {
      console.error(err);
    }
  }

  private initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      this.init = new SpeechRecognition();
      const speech = this.init;

      speech.onresult = (event: any) => {
        const transcript: string = event.results[0][0].transcript;
        const words = transcript.toLowerCase().split(' ');
        if (words.length > 0) speech.text = words;
        console.log(speech.text);

        if (speech.text.length > 0) {
          // Get PLANE CALLSIGN
          const endOfCallsignIdx = getEndOfCallsignIdx(speech.text);
          const callsign = speech.text.slice(0, endOfCallsignIdx);
          console.log({ callsign });

          if (this.selectedPlane) {
            // Get HEADING
            const headingPrefixIdx = speech.text.indexOf('heading');
            const headingStr = speech.text[headingPrefixIdx + 1];
            const headingNum = Number(headingStr);

            // Get TURN
            const turnPrefixIdx = speech.text.indexOf('turn');
            const turnStr = speech.text[turnPrefixIdx + 1];
            if (turnStr === 'left') this.selectedPlane.move.turnTo = 'Left';
            if (turnStr === 'right') this.selectedPlane.move.turnTo = 'Right';

            if (isNaN(headingNum)) {
              this.talk(PilotPhrases.SayAgain);
            } else if (headingNum < 1 || headingNum > 360) {
              this.talk(PilotPhrases.SayAgain);
            } else {
              setTimeout(() => {
                const spokenHeading = convertNumToText(headingStr);
                this.talk(`${PilotPhrases.Roger}, heading ${spokenHeading}`);
                this.selectedPlane.move.newHeading = headingNum;
              }, 500);
            }
          }
        }
      };

      speech.onstart = () => {
        speech.isActive = true;
        console.log('LISTENING...');
      };

      speech.onend = () => {
        speech.isActive = false;
        console.log('SPEECH STOPPED');
      };

      speech.onerror = () => {
        console.error('SPEECH ERROR');
      };
    } else {
      alert(
        `Your browser doesn't support Speech Recognition. Use the latest Chrome.`
      );
    }
  }

  public start() {
    this.init.start();
  }

  private talk(phrase: string) {
    this.selectedPlane.pilotSpeech.talk(phrase);
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

import { PilotPhrases } from '../../../types/PilotPhrases';
import { convertNumToText } from '../../../utils/convertNumToText';
import { Plane } from '../Plane';

/* --------------------- Init Speech Recognition -------------------- */
export class PlaneSpeechRecogntion {
  public init: any;
  public plane: Plane;
  public isActive: boolean;
  public result: {
    text: string[];
  };

  constructor(plane: Plane) {
    this.plane = plane;
    this.isActive = false;
    this.result = {
      text: [''],
    };

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
        if (words.length > 0) this.result.text = words;
        // console.log(this.result.text);

        if (this.result.text.length > 0) {
          // Get PLANE CALLSIGN
          const endOfCallsignIdx = getEndOfCallsignIdx(this.result.text);
          const callsign = this.result.text.slice(0, endOfCallsignIdx);
          console.log({ callsign });

          if (this.plane) {
            // Get HEADING
            const headingPrefixIdx = this.result.text.indexOf('heading');
            const headingStr = this.result.text[headingPrefixIdx + 1];
            const headingNum = Number(headingStr);

            // Get TURN
            const turnPrefixIdx = this.result.text.indexOf('turn');
            const turnStr = this.result.text[turnPrefixIdx + 1];
            if (turnStr === 'left') this.plane.move.turnTo = 'Left';
            if (turnStr === 'right') this.plane.move.turnTo = 'Right';

            if (isNaN(headingNum)) {
              this.talk(PilotPhrases.SayAgain);
            } else if (headingNum < 1 || headingNum > 360) {
              this.talk(PilotPhrases.SayAgain);
            } else {
              setTimeout(() => {
                const spokenHeading = convertNumToText(headingStr);
                this.talk(`${PilotPhrases.Roger}, heading ${spokenHeading}`);
                this.plane.move.newHeading = headingNum;
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

      speech.onerror = (err: any) => {
        console.error('SPEECH ERROR', err);
      };
    } else {
      alert(
        `Your browser doesn't support Speech Recognition. Use the latest Chrome.`
      );
    }
  }

  private talk(phrase: string) {
    this.plane.pilotSpeech.talk(phrase);
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

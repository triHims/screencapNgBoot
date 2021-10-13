import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';

const mediaDevices = navigator.mediaDevices as any;
declare var MediaRecorder: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  recorder: any;
  stream: any;
  frameCount: number = 0;
  blobarr: any[] = [];
  finalBlob: Blob | null = null;
  isRecording: boolean = false;

  ngOnDestroy(): void {
    this.blobarr.length = 0;
    this.recordStop();
  }

  async startRecording() {
    var options;

    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      options = {
        videoBitsPerSecond: 2500000,
        mimeType: 'video/webm; codecs=vp9',
      };
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
      options = {
        videoBitsPerSecond: 2500000,
        mimeType: 'video/webm; codecs=vp8',
      };
    } else {
      options = { videoBitsPerSecond: 2500000, mimeType: 'video/webm' };
    }

    try {
      this.stream = await mediaDevices.getDisplayMedia({
        screen: {
          width: { min: 1024, ideal: 1280, max: 1920 },
          height: { min: 576, ideal: 720, max: 1080 },
          frameRate: { min: 10, ideal: 20, max: 25 },
        },
      });
    } catch (err) {
      alert('No devices found for recording.');
    }
    this.recorder = new MediaRecorder(this.stream, options);
    let metadata: any;

    this.frameCount = 0;

    this.recorder.ondataavailable = (e: { data: any }) => {
      this.blobarr.push(e.data);
      this.frameCount += 1;
    };

    this.recorder.addEventListener('stop', () => {
      this.stream.getTracks().forEach(function (track: any) {
        track.stop();
      });
      this.isRecording = false;
    });

    this.recorder.start(500);
  }

  downloadBlob() {
    let downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(
      new Blob(this.blobarr, { type: this.blobarr[0].type })
    );
    downloadLink.setAttribute('download', 'download.webm');
    document.body.appendChild(downloadLink);
    downloadLink.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(downloadLink.href);
      document.body.removeChild(downloadLink);
    }, 0);
  }

  recordStop() {
    if (this.recorder) {
      this.recorder.stop();
    }
  }

  recordStart() {
    this.isRecording = true;
    this.blobarr.length = 0;
    this.startRecording();
  }
}

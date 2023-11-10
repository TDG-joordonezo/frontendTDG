import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AppService } from './services/app.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  @ViewChild('videoElement', { static: true }) videoElement:
    | ElementRef
    | undefined;
  @ViewChild('canvas2', { static: true }) canvas2: ElementRef | undefined;
  showVideo = true;
  videoConstraints: MediaStreamConstraints = { video: true };
  public prediction = '';
  public color = '';
  public countDown = 15;
  public constDown = 15;
  private intervalCount: any;
  constructor(private appService: AppService) {}

  ngOnInit() {
    this.startCamera();
  }

  async startCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        let videoDeviceIds = [];
  
        for (const device of devices) {
          if (device.kind === 'videoinput') {
            videoDeviceIds.push(device.deviceId);
          }
        }
  
        let nextDeviceId;
  
        if (
          this.videoConstraints &&
          typeof this.videoConstraints.video !== 'boolean' &&
          this.videoConstraints.video &&
          this.videoConstraints.video.deviceId !== undefined
        ) {
          if (typeof this.videoConstraints.video !== 'boolean') {
            const deviceId: string | ConstrainDOMString = this.videoConstraints.video.deviceId;
  
            if (typeof deviceId === 'string') {
              const currentIndex = videoDeviceIds.indexOf(deviceId);
              const nextIndex = (currentIndex + 1) % videoDeviceIds.length;
              nextDeviceId = videoDeviceIds[nextIndex];
            }
          }
        } else {
          nextDeviceId = videoDeviceIds[0];
        }
  
        this.videoConstraints = { video: { deviceId: { exact: nextDeviceId } } };
  
        const stream = await navigator.mediaDevices.getUserMedia(
          this.videoConstraints
        );
  
        if (this.videoElement) {
          this.videoElement.nativeElement.srcObject = stream;
          this.videoElement.nativeElement.play();
        }
        this.updateCanvas();
      } catch (error) {
        console.error('Error accessing the camera:', error);
      }
    }
  }
  
  
  
  toggleCamera() {
    this.showVideo = false;
    this.startCamera();
    this.showVideo = true;
    this.countDown = this.constDown;
    clearInterval(this.intervalCount);
  }
  

  updateCanvas() {
    const canvas2 = this.canvas2?.nativeElement;
    const ctx2 = canvas2?.getContext('2d');

    if (ctx2) {
     this.intervalCount = setInterval(() => {
        if(this.countDown == 0){
          ctx2.drawImage(this.videoElement?.nativeElement, 0, 0, 240, 320);
          this.predictFromCanvas2(canvas2);
          this.countDown = this.constDown;
        }else{
          this.countDown -= 1;
        }
      }, 1000);
    }
  }

  predictFromCanvas2(canvas: HTMLCanvasElement) {
    const image = canvas.toDataURL('image/jpeg');
    this.subscriptions.add(
      this.appService.predict(image).subscribe({
        next: (response:any) => {
          this.prediction = `${response.category} ${(response.highestProbability * 100).toFixed(2)}%`;
          if(response.numCategory == 0){
            this.color = 'green';
          } else{
            this.color = 'red';
          }
        },
        error: (error) => {
          console.log(error);
        },
      })
    );
  }

  onRangeChange(event: Event): void {
    this.constDown = parseInt((event.target as HTMLInputElement).value);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AppService } from './services/app.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';


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
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
  
        if (videoDevices.length > 0) {
          let userSelectedDevice;
  
          if (videoDevices.length === 1) {
            userSelectedDevice = videoDevices[0];
            console.log('Se seleccionó automáticamente la única cámara disponible:', userSelectedDevice.label);
          } else {
            userSelectedDevice = await this.promptUserForCamera(videoDevices);
          }
  
          if (userSelectedDevice) {
            const constraints: MediaStreamConstraints = {
              video: { deviceId: { exact: userSelectedDevice.deviceId } }
            };
  
            try {
              const stream = await navigator.mediaDevices.getUserMedia(constraints);
  
              if (this.videoElement) {
                this.videoElement.nativeElement.srcObject = stream;
                this.videoElement.nativeElement.play();
              }
            } catch (videoError) {
              console.error('Error al acceder al video:', videoError);
  
              console.warn('Intentando obtener una corriente de video sin restricciones.');
              const unrestrictedStream = await navigator.mediaDevices.getUserMedia({ video: true });
  
              if (this.videoElement) {
                this.videoElement.nativeElement.srcObject = unrestrictedStream;
                this.videoElement.nativeElement.play();
              }
            }
          } else {
            console.error('No se seleccionó ninguna cámara.');
          }
        } else {
          console.error('No se encontraron cámaras disponibles.');
        }
      } catch (error) {
        console.error('Error al enumerar dispositivos:', error);
      }
    }
  }
  
  

  async promptUserForCamera(videoDevices: MediaDeviceInfo[]): Promise<MediaDeviceInfo | null> {
    if (videoDevices.length === 1) {
      console.log('Se seleccionó automáticamente la única cámara disponible:', videoDevices[0].label);
      return videoDevices[0];
    }
  
    const options = videoDevices.reduce((acc:any, device:any) => {
      acc[device.deviceId] = device.label || 'Cámara sin etiqueta';
      return acc;
    }, {});
  
    const result = await Swal.fire({
      title: 'Selecciona una cámara',
      input: 'select',
      inputOptions: options,
      showCancelButton: true,
      inputValidator: (value) => {
        return new Promise((resolve) => {
          if (value) {
            const selectedDevice = videoDevices.find(device => device.deviceId === value);
            console.log('Cámara seleccionada:', selectedDevice?.label);
            resolve();
          } else {
            resolve('Debes seleccionar una cámara');
          }
        });
      }
    });
  
    return result.isConfirmed ? videoDevices.find(device => device.deviceId === result.value) || null : null;
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

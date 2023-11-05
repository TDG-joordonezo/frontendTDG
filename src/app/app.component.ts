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
  constructor(private appService: AppService) {}

  ngOnInit() {
    this.startCamera();
  }

  async startCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        // Obtener la lista de dispositivos de video
        const devices = await navigator.mediaDevices.enumerateDevices();
        let videoDeviceId;

        // Encontrar el dispositivo de video correcto
        for (const device of devices) {
          if (device.kind === 'videoinput') {
            videoDeviceId = device.deviceId;
            break;
          }
        }

        // Configurar las restricciones de la cámara
        this.videoConstraints = { video: { deviceId: videoDeviceId } };

        const stream = await navigator.mediaDevices.getUserMedia(
          this.videoConstraints
        );

        if (this.videoElement) {
          this.videoElement.nativeElement.srcObject = stream;
          this.videoElement.nativeElement.play();
        }
        // Actualiza los canvas con la imagen de la cámara
        this.updateCanvas();
      } catch (error) {
        console.error('Error accessing the camera:', error);
      }
    }
  }

  toggleCamera() {
    this.showVideo = false;
    this.startCamera();
  }

  updateCanvas() {
    const canvas2 = this.canvas2?.nativeElement;
    const ctx2 = canvas2?.getContext('2d');

    if (ctx2) {
      setInterval(() => {
        // Dibuja la imagen del video en el canvas 2 (240x320)
        ctx2.drawImage(this.videoElement?.nativeElement, 0, 0, 240, 320);

        // Llama a la función para enviar la imagen a la API de predicción
        this.predictFromCanvas2(canvas2);
      }, 1500); // Actualiza cada 100ms (ajusta según tus necesidades)
    }
  }

  predictFromCanvas2(canvas: HTMLCanvasElement) {
    const image = canvas.toDataURL('image/jpeg'); // Convierte el canvas a una imagen JPEG
   console.log(image)
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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

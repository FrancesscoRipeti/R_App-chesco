import { Component, OnInit } from '@angular/core';
import { AlertController} from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-welcomealum',
  templateUrl: './welcomealum.page.html',
  styleUrls: ['./welcomealum.page.scss'],
})
export class WelcomealumPage implements OnInit {
  cursos: any[] = [];
  userId: string | null = '';  
  nombreCompleto: string = '';
  perfil: string = '';
  nombre: string = '';
  correoUsuario: string = '';  // Definir la propiedad para el correo del usuario
  imgPerfil: string = '';  // Agregar la propiedad para la imagen de perfil
  cursoID: string = '';
  scannedData: any;

  constructor(
    private authService: AuthService,
    private alertController: AlertController,
  ) {}

  async ngOnInit() {
    try {
      // Obtener y mostrar el token de autenticación en la consola
      const token = await this.authService.getToken();
      console.log('Token de autenticación:', token); // Imprime el token en la consola
  
      // Obtener la información del usuario
      const userInfo = await this.authService.getUserInfo();
      userInfo.subscribe(
        (response: any) => {
          console.log('Información del usuario:', response);
          this.nombreCompleto = response.data.nombre_completo;
          this.perfil = response.data.perfil;
          this.correoUsuario = response.data.correo;
          this.imgPerfil = response.data.img;
          if (this.correoUsuario) {
            this.obtenerCursosPorCorreo(this.correoUsuario);
  
            console.log('Correo del usuario:', this.correoUsuario); // Verificar que el correo esté presente
            console.log('Perfil del usuario:', this.perfil);
            console.log('id del usuario:', response.data.id);
          } else {
            console.error('No se pudo obtener el correo del usuario.');
          }
        },
        (error: any) => {
          console.error('Error al obtener la información del usuario:', error);  
        }
      );
    } catch (error) {
      console.error('Error en el proceso de autenticación o carga de cursos:', error);
    }
  }
  async obtenerCursosPorCorreo(correo: string) {
    try {
      const cursosObs = await this.authService.getCursosPorCorreo(correo);
      const response = await cursosObs.toPromise();
      console.log('Cursos obtenidos:', response);
  
      // Verificar si los cursos contienen el código de matrícula
      this.cursos = response.cursos ? response.cursos.map((curso: any) => {
        return {
          ...curso,
          codigo_matricula: curso.codigo_matricula  // Asegurarse de agregar el código de matrícula
        };
      }) : [];
  
      console.log('Cursos con código de matrícula:', this.cursos);  // Verificar que el código esté presente
    } catch (error) {
      console.error('Error al obtener los cursos por correo:', error);
    }
  }

  scanQRCode() {
    BarcodeScanner.checkPermission({ force: true }).then((status) => {
      if (status.granted) {
        BarcodeScanner.hideBackground(); // Ocultar el fondo para escanear
        BarcodeScanner.startScan().then(async (result) => {
          BarcodeScanner.showBackground(); // Mostrar el fondo nuevamente
  
          if (result.hasContent) {
            console.log('QR Code data:', result.content);
            this.scannedData = result.content;
  
            // Verificar si el contenido es una URL válida
            if (this.isValidURL(result.content)) {
              let url = result.content.trim();
              if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
              }
              // Usar el plugin `Browser` para abrir la URL
              await Browser.open({ url });
            } else {
              // Si no es una URL válida, intenta registrar al usuario en la clase
              console.log('Contenido escaneado no es una URL. Intentando registrar en clase...');
              await this.matricularEnCurso(result.content);
            }
          } else {
            this.showScanResult('No se encontró contenido en el código QR.');
          }
        }).catch((err) => {
          console.error('Error al escanear QR:', err);
          BarcodeScanner.showBackground(); // Mostrar el fondo en caso de error
        });
      } else {
        console.log('Permiso denegado para usar la cámara.');
      }
    });
  }
  

  async showScanResult(data: string) {
    const alert = await this.alertController.create({
      header: 'QR Code Scanned',
      message: `Data: ${data}`,
      buttons: ['OK']
    });
    await alert.present();
  }

  async matricularEnCurso(courseCode: string) {
    try {
      (await this.authService.unirseACursoPorCodigo(courseCode)).subscribe(
        (response) => {
          console.log('Enrolled successfully:', response);
          this.showScanResult('Enrolled successfully in course: ' + courseCode);
        },
        (error) => {
          console.error('Error enrolling in course:', error);
          this.showScanResult('Failed to enroll in course: ' + courseCode);
        }
      );
    } catch (error) {
      console.error('Error en el proceso de matrícula:', error);
    }
  }

  // Método para verificar si el contenido es una URL válida
  isValidURL(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }
}

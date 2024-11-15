import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
})
export class DetallePage implements OnInit {
  curso: any;
  clases: any[] = [];
  qrData: string = '';
  showQRCode: boolean = false;
  codigoQR: string = ''; // Variable para almacenar el contenido que se convertirá en QR

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {}


  ngOnInit() {
    const cursoId = this.route.snapshot.paramMap.get('id');
    console.log('ID del curso recibido en DetallePage:', cursoId); // Verificar que el ID esté presente
    if (cursoId) {
      this.cargarDetalleCurso(cursoId);
      this.cargarClasesDelCurso(cursoId);
    }
  }
  

  async cargarDetalleCurso(id: string) {
    try {
      // Llamada directa sin 'await' al 'subscribe'
      const response = await this.authService.getCursoPorID(id);
      
      // Verifica que response tenga la estructura esperada
      if (response && response.curso) {
        this.curso = response.curso;
      } else {
        console.error('La respuesta no contiene la información del curso esperada:', response);
      }
    } catch (error) {
      console.error('Error al solicitar los detalles del curso:', error);
    }
  }
  

  async cargarClasesDelCurso(id: string) {
  try {
    const clasesObs = await this.authService.getClasesPorCursoId(id);
    clasesObs.subscribe(
      (response: any) => {
        if (response.clases) {
          this.clases = response.clases;
          console.log('Datos de las clases:', this.clases); // Imprime toda la lista de clases

          // Imprime cada clase y su código_web
          this.clases.forEach(clase => {
            console.log('Clase:', clase);
            console.log('Código web de la clase:', clase.codigo_web); // Verificar que `codigo_web` esté presente
          });
        }
      },
      (error: any) => {
        console.error('Error al cargar las clases del curso:', error);
      }
    );
  } catch (error) {
    console.error('Error al solicitar las clases del curso:', error);
  }
}

  
  obtenerDiaSemana(fecha: string): string {
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const fechaObj = new Date(fecha);
    return diasSemana[fechaObj.getUTCDay()];
  }

  verDetallesClase(cursoId: number, codigo_web: string) {
    console.log('Navegando a la clase con código web:', codigo_web); // Verificar `codigo_web`
    this.router.navigate([`/detalle/${cursoId}/clase/${codigo_web}`]);
  }
  
  async crearClase(cursoId: number) {
    const alert = await this.alertController.create({
      header: 'Crear Nueva Clase',
      inputs: [
        {
          name: 'fecha',
          type: 'date',
          placeholder: 'Fecha de la clase'
        },
        {
          name: 'horaInicio',
          type: 'time',
          placeholder: 'Hora de inicio'
        },
        {
          name: 'horaTermino',
          type: 'time',
          placeholder: 'Hora de término'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Crear',
          handler: async (data) => {
            console.log('Datos de la nueva clase:', data);
            const claseData = {
              fecha: data.fecha,
              hora_inicio: data.horaInicio,
              hora_termino: data.horaTermino
            };

            try {
              const claseObs = await this.authService.crearClase(cursoId, claseData);
              claseObs.subscribe(
                (response: any) => {
                  console.log('Clase creada exitosamente:', response);
                  this.alertController.create({
                    header: 'Éxito',
                    message: 'Clase creada exitosamente',
                    buttons: ['OK']
                  }).then(alertEl => alertEl.present());

                  this.cargarClasesDelCurso(cursoId.toString());
                },
                (error: any) => {
                  console.error('Error al crear la clase:', error);
                }
              );
            } catch (error) {
              console.error('Error en la creación de la clase:', error);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  generarQR() {
    // Lógica adicional si es necesaria antes de mostrar el QR
    console.log('Generando QR para:', this.codigoQR);
  }
}

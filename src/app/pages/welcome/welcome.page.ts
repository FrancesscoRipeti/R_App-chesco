import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { ModalController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {

  cursos: any[] = [];
  userId: string | null = '';  
  nombreCompleto: string = '';
  perfil: string = '';
  nombre: string = '';
  correoUsuario: string = '';  // Definir la propiedad para el correo del usuario
  imgPerfil: string = '';  // Agregar la propiedad para la imagen de perfil
  cursoID: string = '';
  codigoMatriculaQR: string = '';


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private menu: MenuController,
    private authService: AuthService,
    private alertController: AlertController,
    private modalController: ModalController
  ) { }

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
  

  // Abrir formulario para crear una clase en un curso específico
  async verDetallesCurso(curso: any) {
    console.log('ID del curso seleccionado:', curso.id); // Verificar que el ID esté presente
    this.router.navigate(['/detalle', curso.id], { state: { curso: curso } });
  }
  

  cerrarSesion() {
    if (confirm('¿Desea cerrar sesión?')) {
      this.router.navigate(['/home']);
    }
  }

  btnClickPrueba() {
    this.router.navigate(['/recuperar']);
  }

  openMenu() {
    this.menu.open();
  }

  // Abrir opciones para generar QR o crear un curso
  

  generarQR() {
    console.log('Generando QR...');
  }

  // Formulario para crear un curso
  async crearCurso() {
    const alert = await this.alertController.create({
      header: 'Crear nuevo curso',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Nombre del curso'
        },
        {
          name: 'sigla',
          type: 'text',
          placeholder: 'Sigla del curso'
        },
        {
          name: 'institucion',
          type: 'text',
          placeholder: 'Institución'
        },
        {
          name: 'descripcion',
          type: 'textarea',
          placeholder: 'Descripción del curso'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Crear',
          handler: (data) => {
            this.enviarDatosCurso(data); // Asegúrate de que esta función exista o corrige su nombre
          }
        }
      ]
    });

    await alert.present();
  }

  // Enviar los datos para crear el curso
  async enviarDatosCurso(data: any) {
    try {
      const cursoObs = await this.authService.crearCurso(data);
      cursoObs.subscribe(
        async (response: any) => {
          console.log('Curso creado exitosamente:', response);
  
          // Guarda el código de matrícula que viene de la respuesta
          const nuevoCurso = response.data;
          this.cursos.push(nuevoCurso); // Añade el nuevo curso a la lista de cursos
  
          // Asegúrate de que el código de matrícula esté disponible
          this.codigoMatriculaQR = nuevoCurso.codigo_matricula;
          
          console.log('Código de Matrícula:', this.codigoMatriculaQR); // Verificar que el código esté presente
        },
        (error: any) => {
          console.error('Error al crear el curso:', error);
        }
      );
    } catch (error) {
      console.error('Error en la creación del curso:', error);
    }
  }
  

  async mostrarFormularioClase(idCurso: number) {
    const alert = await this.alertController.create({
      header: 'Crear Clase',
      inputs: [
        {
          name: 'fecha',
          type: 'date',
          placeholder: 'Fecha de la clase'
        },
        {
          name: 'hora_inicio',
          type: 'time',
          placeholder: 'Hora de inicio'
        },
        {
          name: 'hora_termino',
          type: 'time',
          placeholder: 'Hora de término'
        }
      ],
      buttons: [
        {
          text: 'No crear',
          role: 'cancel'
        },
        {
          text: 'Crear Clase',
          handler: (claseData) => {
            this.enviarDatosClase(idCurso, claseData);
          }
        }
      ]
    });

    await alert.present();
  }

  async enviarDatosClase(idCurso: number, claseData: any) {
    try {
      const claseObs = await this.authService.crearClase(idCurso, claseData);
      claseObs.subscribe(
        async (response: any) => {
          console.log('Clase creada exitosamente:', response);
          const alert = await this.alertController.create({
            header: 'Éxito',
            message: 'Clase creada exitosamente para el curso',
            buttons: ['OK']
          });
          await alert.present();
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

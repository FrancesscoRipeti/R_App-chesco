import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-clase',
  templateUrl: './clase.page.html',
  styleUrls: ['./clase.page.scss'],
})
export class ClasePage implements OnInit {
  cursoId: number | null = null; // Inicializado con null para evitar el error
  claseId: number | null = null; // Inicializado con null para evitar el error
  asistencia: any[] = [];
  claseInfo: any;
  code: string = '';
  totalAsistencias: number = 0;
  mensaje: string = '';

  constructor(private route: ActivatedRoute, private authService: AuthService) {}

  ngOnInit() {
    const cursoIdParam = this.route.snapshot.paramMap.get('id');
    const claseIdParam = this.route.snapshot.paramMap.get('claseId');

    if (cursoIdParam) {
      this.cursoId = Number(cursoIdParam);
    }
    if (claseIdParam) {
      this.claseId = Number(claseIdParam);
    }

    if (this.cursoId !== null && this.claseId !== null) {
      this.cargarHistorialAsistencia(this.cursoId, this.claseId);
    }
  }

  async cargarHistorialAsistencia(cursoId: number, claseId: number) {
    try {
      const asistenciaObs = await this.authService.obtenerHistorialAsistencia(cursoId, claseId);
      asistenciaObs.subscribe(
        (response: any) => {
          console.log('Respuesta de asistencia:', response);
          this.mensaje = response.message;
          this.claseInfo = response.clase;
          this.totalAsistencias = response.total;
          this.asistencia = response.asistencias;
        },
        (error) => {
          console.error('Error al cargar el historial de asistencia:', error);
        }
      );
    } catch (error) {
      console.error('Error al solicitar el historial de asistencia:', error);
    }
  }
}

import ContentPage from "../components/ContentPage";

export default function Terms() {
  return (
    <ContentPage title="Términos de uso" updated="[fecha]">
      <p className="italic text-ink/50">
        Nota: esto es una plantilla general para orientarte. No es asesoría legal.
        Reemplaza los textos entre corchetes con tus datos reales; si vas a cobrar
        por el servicio te conviene que un abogado la revise antes de publicarla.
      </p>

      <section>
        <h2 className="font-display text-xl text-ink mb-2">Aceptación</h2>
        <p>
          Al crear una cuenta en [nombre de tu app], aceptas estos términos.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl text-ink mb-2">Uso del servicio</h2>
        <p>
          Este servicio es para organizar y leer libros que tú posees o tienes
          derecho a leer. No debes subir contenido que no seas dueño de compartir
          contigo mismo(a), ni distribuir el contenido de otras personas.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl text-ink mb-2">Tu cuenta</h2>
        <p>
          Eres responsable de mantener tu contraseña en privado y de la actividad
          que ocurra en tu cuenta.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl text-ink mb-2">Disponibilidad</h2>
        <p>
          Hacemos lo posible por mantener el servicio disponible, pero no
          garantizamos que esté libre de interrupciones.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl text-ink mb-2">Cambios</h2>
        <p>Podemos actualizar estos términos; te avisaremos de cambios importantes.</p>
      </section>

      <section>
        <h2 className="font-display text-xl text-ink mb-2">Contacto</h2>
        <p>[tu correo de contacto]</p>
      </section>
    </ContentPage>
  );
}

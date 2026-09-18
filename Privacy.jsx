import ContentPage from "../components/ContentPage";

export default function Privacy() {
  return (
    <ContentPage title="Política de privacidad" updated="[fecha]">
      <p className="italic text-ink/50">
        Nota: esto es una plantilla general para orientarte. No es asesoría legal.
        Reemplaza los textos entre corchetes con tus datos reales, y si vas a
        cobrar por el servicio o manejar datos de menores de edad, te conviene que
        un abogado la revise antes de publicarla.
      </p>

      <section>
        <h2 className="font-display text-xl text-ink mb-2">Quiénes somos</h2>
        <p>
          [Nombre de tu app/negocio] ("nosotros") opera este sitio en
          [tu-dominio.com]. Puedes contactarnos en [tu correo de contacto].
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl text-ink mb-2">Qué información recopilamos</h2>
        <p>
          Al crear una cuenta guardamos tu nombre, correo electrónico y una
          contraseña cifrada (o tu identificador de Google, si entras con esa
          opción). Al subir libros, almacenamos los archivos que tú decidas subir
          y la información que describe tu biblioteca (títulos, carpetas, progreso
          de lectura).
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl text-ink mb-2">Cómo usamos tu información</h2>
        <p>
          Usamos tus datos únicamente para operar el servicio: mostrarte tu
          biblioteca, sincronizar tu progreso de lectura entre dispositivos, y
          comunicarnos contigo sobre tu cuenta (por ejemplo, para recuperar tu
          contraseña). No vendemos tu información a terceros.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl text-ink mb-2">Dónde se guarda</h2>
        <p>
          Tus datos y archivos se almacenan de forma privada usando Supabase como
          proveedor de infraestructura. Cada persona solo puede ver y administrar
          su propia biblioteca.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl text-ink mb-2">Tus derechos</h2>
        <p>
          Puedes pedirnos en cualquier momento que eliminemos tu cuenta y toda tu
          información escribiendo a [tu correo de contacto].
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl text-ink mb-2">Menores de edad</h2>
        <p>
          Si una persona menor de edad usa el servicio, debe hacerlo con la
          supervisión y el consentimiento de su madre, padre o tutor.
        </p>
      </section>
    </ContentPage>
  );
}

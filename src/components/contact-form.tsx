"use client";

import { FormEvent, useState } from "react";

export function ContactForm(): JSX.Element {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_PRIMARY ?? "5562992002643";
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    setSubmitting(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    const nome = data.get("nome");
    const tel = data.get("tel");
    const email = data.get("email");
    const veiculo = data.get("veiculo");
    const msg = data.get("msg");

    const lines = [
      "Olá! Vim pelo site da Ceará Auto Elétrica.",
      "",
      `Nome: ${nome}`,
      `Telefone: ${tel}`,
      email ? `E-mail: ${email}` : null,
      veiculo ? `Caminhão: ${veiculo}` : null,
      "",
      "Mensagem:",
      String(msg ?? "")
    ].filter(Boolean) as string[];

    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/${whatsapp}?text=${text}`, "_blank");

    setTimeout(() => setSubmitting(false), 800);
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} data-reveal="right">
      <span className="eyebrow" style={{ marginBottom: 6 }}>Fale conosco</span>
      <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", marginBottom: 28 }}>Envie sua mensagem.</h2>

      <div className="field">
        <input id="nome" name="nome" type="text" placeholder=" " required />
        <label htmlFor="nome">Seu nome</label>
      </div>
      <div className="field">
        <input id="tel" name="tel" type="tel" placeholder=" " required />
        <label htmlFor="tel">Telefone / WhatsApp</label>
      </div>
      <div className="field">
        <input id="email" name="email" type="email" placeholder=" " />
        <label htmlFor="email">E-mail (opcional)</label>
      </div>
      <div className="field">
        <input id="veiculo" name="veiculo" type="text" placeholder=" " />
        <label htmlFor="veiculo">Marca / modelo do caminhão</label>
      </div>
      <div className="field">
        <textarea id="msg" name="msg" placeholder=" " required />
        <label htmlFor="msg">Descreva sua necessidade</label>
      </div>

      <button className="btn btn--lg btn--block" type="submit" data-magnetic disabled={submitting}>
        {submitting ? "Abrindo WhatsApp..." : "Enviar pelo WhatsApp"}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M20.5 3.5A11 11 0 003.6 17l-1.6 5 5.1-1.5A11 11 0 1020.5 3.5z" />
        </svg>
      </button>

      <p style={{ marginTop: 16, color: "var(--text-mute)", fontSize: "0.82rem", textAlign: "center" }}>
        Ao enviar, abriremos o WhatsApp com sua mensagem já preenchida.
      </p>
    </form>
  );
}

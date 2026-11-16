import React, { useState } from 'react';
import { ProjectDetails, RequestInput } from '../contracts/models';

interface CollaborationModalProps {
  project: ProjectDetails;
  onClose: () => void;
  onSubmitRequest: (input: RequestInput) => Promise<void>;
}

export default function CollaborationModal({ project, onClose, onSubmitRequest }: CollaborationModalProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const MAX_CHARS = 300;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('El mensaje de presentación es obligatorio.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmitRequest({
        projectId: project.id,
        message: message.trim()
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || 'Ocurrió un error al enviar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(36, 26, 41, 0.5)',
      display: 'grid',
      placeItems: 'center',
      padding: '16px',
      zIndex: 1000
    }}>
      <div className="tarjeta" style={{ width: '100%', maxWidth: '540px', padding: 0, overflow: 'hidden' }}>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="formulario">
            <div>
              <h2 style={{ fontSize: '22px' }}>Solicitud de colaboración</h2>
              <p className="subtitulo" style={{ margin: '4px 0 0', fontSize: '14px' }}>
                Proyecto: <strong>{project.title}</strong>
              </p>
            </div>

            <fieldset className="campo">
              <div className="campo-cabecera">
                <label htmlFor="message">Mensaje de presentación <span className="obligatorio">*</span></label>
                <span className={`contador ${message.length > MAX_CHARS ? 'excedido' : ''}`}>
                  {message.length}/{MAX_CHARS}
                </span>
              </div>
              <p className="ayuda">Cuéntale a la creadora por qué te interesa sumarte y qué experiencia aportarías.</p>
              <textarea
                id="message"
                rows={4}
                className={`entrada ${error ? 'con-error' : ''}`}
                placeholder="Hola, tengo experiencia en..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={MAX_CHARS}
              />
              {error && <p className="error">{error}</p>}
            </fieldset>

            <div className="acciones">
              <button type="button" className="boton secundario" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button type="submit" className="boton primario" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </div>
          </form>
        ) : (
          <div className="confirmacion">
            <div className="sello">✓</div>
            <h2>¡Solicitud enviada!</h2>
            <p className="subtitulo" style={{ fontSize: '14px' }}>
              Tu mensaje ha sido registrado correctamente y la responsable del proyecto lo revisará en su panel.
            </p>
            <div className="acciones centradas">
              <button className="boton primario" onClick={onClose}>
                Entendido
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
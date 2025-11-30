import React, { useState } from "react";
import "../styles/ModalCancelarPedido.css";

function ModalCancelarPedido({ abierto, onClose, onConfirmar }) {
    const [mostrarPopup, setMostrarPopup] = useState(false);
    const [motivo, setMotivo] = useState("");
    
    const motivosCancelacion = [
        "No estoy para recibir mi compra",
        "Me arrepentí",
        "Error en el pedido",
        "Quiero modificar mi orden",
        "Otro"
    ];

    if (!abierto) return null;
    
    return(
    <>
        <div className="popup-bg">
            <div className="popup-card">
            <h3>¿Por qué querés cancelar tu pedido?</h3>
            <p>Tu respuesta nos ayuda a mejorar la experiencia de usuario.</p>

            <div className="motivos-lista">
                {motivosCancelacion.map((m, i) => (
                <label key={i} className="motivo-item">
                    <input
                    type="radio"
                    name="motivo"
                    value={m}
                    onChange={() => setMotivo(m)}
                    />
                    {m}
                </label>
                ))}
            </div>

            <div className="popup-botones">
                <button
                    className="btn-confirmar"
                    disabled={!motivo}
                    onClick={() => {
                    onConfirmar(motivo);
                    setMotivo("");
                    }}
                >
                    Confirmar cancelación
                </button>

                <button
                className="btn-cerrar"
                onClick={() => {
                setMotivo("");
                onClose();
                }}
                >
                Cerrar
                </button>
            </div>
            </div>
        </div>
    </>
 );
}

export default ModalCancelarPedido;

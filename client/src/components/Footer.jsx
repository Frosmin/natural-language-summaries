import React from "react";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-200 pt-10 pb-6 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-sm">
                {/* Créditos */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M7 9h10V7H7zM5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v6.45q-.575-1.125-1.65-1.787T17 9q-1.125 0-2.1.525T13.275 11H7v2h5.525q-.05.5 0 1t.225 1H7v2h3.925q-.475.55-.7 1.213T10 19.6V21zm7 0v-1.4q0-.6.313-1.112t.887-.738q.9-.375 1.863-.562T17 17t1.938.188t1.862.562q.575.225.888.738T22 19.6V21zm5-5q-1.05 0-1.775-.725T14.5 13.5t.725-1.775T17 11t1.775.725t.725 1.775t-.725 1.775T17 16"/></svg>
                        <h2 className="text-lg font-semibold text-white">Créditos</h2>
                    </div>
                    <p className="mb-1">Materia: <span className="font-medium text-gray-300">Inteligencia Artificial</span></p>
                    <p className="mb-1">Docente: <span className="font-medium text-gray-300">Patricia Erika Rodríguez Bilbao</span></p>
                    <p>Universidad Mayor de San Simón</p>
                </div>

                {/* Información del Trabajo */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M16.5 19q1.05 0 1.775-.725T19 16.5t-.725-1.775T16.5 14t-1.775.725T14 16.5t.725 1.775T16.5 19m5.8 3.3q-.275.275-.7.275t-.7-.275l-2-2q-.525.35-1.137.525T16.5 21q-1.875 0-3.187-1.312T12 16.5t1.313-3.187T16.5 12t3.188 1.313T21 16.5q0 .65-.175 1.263T20.3 18.9l2 2q.275.275.275.7t-.275.7M5 22q-.825 0-1.412-.587T3 20V4q0-.825.588-1.412T5 2h7.175q.4 0 .763.15t.637.425l4.85 4.85q.275.275.425.638t.15.762v.45q0 .45-.363.725t-.812.15q-.325-.075-.65-.113T16.5 10q-2.95 0-4.75 2t-1.8 4.525q0 1.1.388 2.175t1.212 2.025q.35.375.162.825t-.637.45zm7-18v4q0 .425.288.713T13 9h4zl5 5z"/></svg>
                        <h2 className="text-lg font-semibold text-white">Información del Trabajo</h2>
                    </div>
                    <p className="mb-1"><span className="font-medium text-gray-300">Grupo No 8</span></p>
                    <p className="mb-1">Área: <span className="font-medium text-gray-300">Aprendizaje No Supervisado</span></p>
                    <p className="mb-1">Subárea: <span className="font-medium text-gray-300">Procesamiento del Lenguaje Natural</span></p>
                    <p>Problema: <span className="font-medium text-gray-300">Generador de Resúmenes</span></p>
                </div>

                {/* Integrantes */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M12 12q-1.65 0-2.825-1.175T8 8t1.175-2.825T12 4t2.825 1.175T16 8t-1.175 2.825T12 12m-8 8v-2.8q0-.85.438-1.562T5.6 14.55q1.55-.775 3.15-1.162T12 13t3.25.388t3.15 1.162q.725.375 1.163 1.088T20 17.2V20z"/></svg>
                        <h2 className="text-lg font-semibold text-white">Integrantes</h2>
                    </div>
                    <ul className="space-y-1 list-disc list-inside text-gray-300">
                        <li>Abasto Martinis Simon Eduardo</li>
                        <li>Bolivar Puma Isac Poly</li>
                        <li>Gutierrez Copara Carlos Antonio</li>
                        <li>Rojas Carvajal Ricardo</li>
                        <li>Rojas Rojas Adrian Alex</li>
                        <li>Velasquez Ricaldez Rodrigo</li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-gray-700 mt-10 pt-4 text-center text-xs text-gray-500">
                © {new Date().getFullYear()} Proyecto de Inteligencia Artificial - UMSS.
            </div>
        </footer>
    );
}

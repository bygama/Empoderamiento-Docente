"use client";

import { crearClienteDeAuth } from "@ed/auth";

// El cliente del navegador. La URL vacía hace que pegue al mismo origen, que
// es lo que queremos: el admin y su API viven en el mismo deployable.
export const authCliente = crearClienteDeAuth("");

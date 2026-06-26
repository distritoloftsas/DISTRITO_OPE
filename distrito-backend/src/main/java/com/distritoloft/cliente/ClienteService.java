package com.distritoloft.cliente;

import com.distritoloft.cliente.dto.ActivarCuentaClienteRequest;
import com.distritoloft.cliente.dto.ActualizarClienteRequest;
import com.distritoloft.cliente.dto.ClienteResponse;
import com.distritoloft.cliente.dto.CrearClienteRequest;
import com.distritoloft.common.enums.RolUsuario;
import com.distritoloft.common.exception.RecursoNoEncontradoException;
import com.distritoloft.common.exception.ReglaNegocioException;
import com.distritoloft.usuario.ClientePerfil;
import com.distritoloft.usuario.Usuario;
import com.distritoloft.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<ClienteResponse> buscar(String q) {
        List<Usuario> usuarios = (q == null || q.isBlank())
                ? usuarioRepository.listarClientes(RolUsuario.CLIENTE)
                : usuarioRepository.buscarClientes(q.trim(), RolUsuario.CLIENTE);
        return usuarios.stream().map(ClienteResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public long contar() {
        return usuarioRepository.countByRolAndActivoTrue(RolUsuario.CLIENTE);
    }

    @Transactional
    public ClienteResponse actualizar(Long id, ActualizarClienteRequest req) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente no encontrado: " + id));
        if (u.getRol() != RolUsuario.CLIENTE) {
            throw new ReglaNegocioException("El usuario " + id + " no es un cliente.");
        }

        String nuevoTelefono = req.telefono().trim();
        if (!nuevoTelefono.equals(u.getTelefono())
                && usuarioRepository.existsByTelefono(nuevoTelefono)) {
            throw new ReglaNegocioException("Ya existe un usuario con el teléfono " + nuevoTelefono + ".");
        }

        String nuevoEmail = (req.email() == null || req.email().isBlank()) ? null : req.email().trim();
        if (nuevoEmail != null && !nuevoEmail.equalsIgnoreCase(u.getEmail())
                && usuarioRepository.existsByEmail(nuevoEmail)) {
            throw new ReglaNegocioException("Ya existe un usuario con ese email.");
        }

        u.setNombre(req.nombre().trim());
        u.setTelefono(nuevoTelefono);
        u.setEmail(nuevoEmail);

        if (u.getClientePerfil() != null) {
            u.getClientePerfil().setDireccionPrincipal(req.direccionPrincipal());
        } else {
            ClientePerfil perfil = new ClientePerfil();
            perfil.setUsuario(u);
            perfil.setDireccionPrincipal(req.direccionPrincipal());
            u.setClientePerfil(perfil);
        }
        return ClienteResponse.from(u);
    }

    @Transactional
    public ClienteResponse activarCuenta(Long id, ActivarCuentaClienteRequest req) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente no encontrado: " + id));
        if (u.getRol() != RolUsuario.CLIENTE) {
            throw new ReglaNegocioException("El usuario " + id + " no es un cliente.");
        }

        String nuevoEmail = req.email().trim();
        if (!nuevoEmail.equalsIgnoreCase(u.getEmail())
                && usuarioRepository.existsByEmail(nuevoEmail)) {
            throw new ReglaNegocioException("Ya existe un usuario con ese email.");
        }

        u.setEmail(nuevoEmail);
        u.setPasswordHash(passwordEncoder.encode(req.password()));
        u.setMustChangePassword(true);
        return ClienteResponse.from(u);
    }

    @Transactional(readOnly = true)
    public ClienteResponse obtener(Long id) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente no encontrado: " + id));
        if (u.getRol() != RolUsuario.CLIENTE) {
            throw new ReglaNegocioException("El usuario " + id + " no es un cliente.");
        }
        return ClienteResponse.from(u);
    }

    @Transactional
    public ClienteResponse crear(CrearClienteRequest req) {
        if (usuarioRepository.existsByTelefono(req.telefono())) {
            throw new ReglaNegocioException("Ya existe un usuario con el teléfono " + req.telefono() + ".");
        }
        if (req.email() != null && !req.email().isBlank() && usuarioRepository.existsByEmail(req.email())) {
            throw new ReglaNegocioException("Ya existe un usuario con ese email.");
        }

        Usuario u = new Usuario();
        u.setRol(RolUsuario.CLIENTE);
        u.setNombre(req.nombre().trim());
        u.setTelefono(req.telefono().trim());
        u.setEmail(req.email() == null || req.email().isBlank() ? null : req.email().trim());
        u.setActivo(true);

        ClientePerfil perfil = new ClientePerfil();
        perfil.setUsuario(u);
        perfil.setDireccionPrincipal(req.direccionPrincipal());
        u.setClientePerfil(perfil);

        Usuario guardado = usuarioRepository.save(u);
        return ClienteResponse.from(guardado);
    }
}

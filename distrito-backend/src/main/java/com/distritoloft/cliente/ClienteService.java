package com.distritoloft.cliente;

import com.distritoloft.cliente.dto.ClienteResponse;
import com.distritoloft.cliente.dto.CrearClienteRequest;
import com.distritoloft.common.enums.RolUsuario;
import com.distritoloft.common.exception.RecursoNoEncontradoException;
import com.distritoloft.common.exception.ReglaNegocioException;
import com.distritoloft.usuario.ClientePerfil;
import com.distritoloft.usuario.Usuario;
import com.distritoloft.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<ClienteResponse> buscar(String q) {
        if (q == null || q.isBlank()) return List.of();
        return usuarioRepository.buscarClientes(q.trim(), RolUsuario.CLIENTE).stream()
                .map(ClienteResponse::from)
                .toList();
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

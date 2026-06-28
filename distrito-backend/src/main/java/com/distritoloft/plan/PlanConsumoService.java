package com.distritoloft.plan;

import com.distritoloft.auth.CustomUserDetails;
import com.distritoloft.common.enums.RolUsuario;
import com.distritoloft.common.enums.UnidadInsumo;
import com.distritoloft.common.exception.RecursoNoEncontradoException;
import com.distritoloft.common.exception.ReglaNegocioException;
import com.distritoloft.insumo.Insumo;
import com.distritoloft.insumo.InsumoRepository;
import com.distritoloft.plan.dto.CrearPlanConsumoRequest;
import com.distritoloft.plan.dto.PlanConsumoResponse;
import com.distritoloft.usuario.Usuario;
import com.distritoloft.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlanConsumoService {

    private final PlanConsumoRepository repo;
    private final PlanRepository planRepository;
    private final InsumoRepository insumoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<PlanConsumoResponse> listar(CustomUserDetails principal, Long planId) {
        validarRolStaff(cargarUsuarioActual(principal));
        return repo.findByPlan(planId).stream().map(PlanConsumoResponse::from).toList();
    }

    @Transactional
    public PlanConsumoResponse crear(CustomUserDetails principal, Long planId, CrearPlanConsumoRequest req) {
        Usuario actual = cargarUsuarioActual(principal);
        validarRolStaff(actual);

        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Plan no encontrado: " + planId));
        Insumo insumo = insumoRepository.findById(req.insumoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Insumo no encontrado: " + req.insumoId()));

        if (actual.getRol() == RolUsuario.GERENTE_SEDE) {
            Long sedeGerente = actual.getEmpleadoPerfil().getSede().getId();
            if (!insumo.getSede().getId().equals(sedeGerente)) {
                throw new ReglaNegocioException("El insumo no pertenece a tu sede.");
            }
        }

        if (repo.existsByPlanIdAndInsumoIdAndFase(planId, req.insumoId(), req.fase())) {
            throw new ReglaNegocioException(
                    "Ya existe una línea de consumo de ese insumo en esa fase. Editala o eliminala.");
        }

        if (!UnidadInsumo.sonCompatibles(req.unidad(), insumo.getUnidad())) {
            throw new ReglaNegocioException(
                    "La unidad de la receta (" + req.unidad() + ") no es compatible con la del insumo ("
                            + insumo.getUnidad() + "). Solo se puede convertir entre volumen (ml/l) o entre peso (g/kg).");
        }

        PlanConsumo pc = new PlanConsumo();
        pc.setPlan(plan);
        pc.setInsumo(insumo);
        pc.setFase(req.fase());
        pc.setCantidad(req.cantidad());
        pc.setUnidad(req.unidad());
        return PlanConsumoResponse.from(repo.save(pc));
    }

    @Transactional
    public void eliminar(CustomUserDetails principal, Long planConsumoId) {
        Usuario actual = cargarUsuarioActual(principal);
        validarRolStaff(actual);
        PlanConsumo pc = repo.findById(planConsumoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Línea no encontrada: " + planConsumoId));
        if (actual.getRol() == RolUsuario.GERENTE_SEDE) {
            Long sedeGerente = actual.getEmpleadoPerfil().getSede().getId();
            if (!pc.getInsumo().getSede().getId().equals(sedeGerente)) {
                throw new ReglaNegocioException("No puedes modificar líneas de consumo de otra sede.");
            }
        }
        repo.delete(pc);
    }

    private void validarRolStaff(Usuario u) {
        // Acceso fino en el controller via @PreAuthorize('GESTIONAR_RECETAS').
        // Aqui solo bloqueamos a clientes por defensa adicional.
        if (u.getRol() == RolUsuario.CLIENTE) {
            throw new ReglaNegocioException("Los clientes no manejan recetas.");
        }
    }

    private Usuario cargarUsuarioActual(CustomUserDetails principal) {
        return usuarioRepository.findById(principal.getUsuario().getId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario actual no encontrado."));
    }
}

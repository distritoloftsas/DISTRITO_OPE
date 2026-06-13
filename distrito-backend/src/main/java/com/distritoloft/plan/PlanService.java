package com.distritoloft.plan;

import com.distritoloft.plan.dto.PlanResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlanService {

    private final PlanRepository planRepository;

    public List<PlanResponse> listar(boolean incluirInactivos) {
        List<Plan> planes = incluirInactivos
                ? planRepository.findAllByOrderByOrdenAsc()
                : planRepository.findByActivoTrueOrderByOrdenAsc();

        return planes.stream().map(PlanResponse::from).toList();
    }
}

package com.distritoloft.plan;

import com.distritoloft.plan.dto.PlanResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/planes")
@RequiredArgsConstructor
public class PlanController {

    private final PlanService planService;

    @GetMapping
    public List<PlanResponse> listar(
            @RequestParam(name = "incluirInactivos", required = false, defaultValue = "false")
            boolean incluirInactivos
    ) {
        return planService.listar(incluirInactivos);
    }
}

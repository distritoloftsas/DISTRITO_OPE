package com.distritoloft.plan;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlanRepository extends JpaRepository<Plan, Long> {

    List<Plan> findByActivoTrueOrderByOrdenAsc();
}

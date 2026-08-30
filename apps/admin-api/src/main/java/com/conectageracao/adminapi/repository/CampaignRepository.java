package com.conectageracao.adminapi.repository;

import com.conectageracao.adminapi.domain.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CampaignRepository extends JpaRepository<Campaign, String>, JpaSpecificationExecutor<Campaign> {
    boolean existsByIdempotencyKey(String idempotencyKey);
}

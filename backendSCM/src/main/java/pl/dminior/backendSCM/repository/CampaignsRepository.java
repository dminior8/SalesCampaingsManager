package pl.dminior.backendSCM.repository;

import pl.dminior.backendSCM.model.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CampaignsRepository extends JpaRepository<Campaign, Long> {
}
package pl.dminior.backendSCM.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pl.dminior.backendSCM.model.Product;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    Product findProductById(UUID productId);

    @Query(value = "SELECT product.* FROM product " +
            "LEFT JOIN campaign ON campaign.product_id = product.id " +
            "WHERE campaign_city.campaign_id = ?1",
            nativeQuery = true)
    List<Product> findAllByUserId(UUID userId);
}

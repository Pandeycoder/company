package com.company.repo;

import com.company.entity.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable; // ✅ Correct import
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyRepo extends JpaRepository<Company, Long> {

    // Search by name with pagination
    Page<Company> findByNameContaining(String name, Pageable pageable);

    // Optional: Search by email with pagination
    Page<Company> findByEmail(String email, Pageable pageable);
}

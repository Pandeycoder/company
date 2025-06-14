package com.company.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.company.entity.Company;

public interface CompanyRepo extends JpaRepository<Company, Long> {
	    
	List<Company> findByNameContaining(String name);
    List<Company> findByEmail(String email);
    
	}
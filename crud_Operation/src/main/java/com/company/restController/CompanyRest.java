package com.company.restController;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Pageable;


import com.company.entity.Company;
import com.company.repo.CompanyRepo;

@RestController
@RequestMapping("/api/companies")
@CrossOrigin(origins = "http://localhost:3000")
public class CompanyRest {

    @Autowired
    private CompanyRepo companyRepository;

    // Create new company
    @PostMapping
    public ResponseEntity<Company> createCompany(@RequestBody Company company) {
        Company savedCompany = companyRepository.save(company);
        return ResponseEntity.ok(savedCompany);
    }

    // Get all companies with pagination
    @GetMapping
    public ResponseEntity<Page<Company>> getAllCompanies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Company> companies = companyRepository.findAll(pageable);
        return ResponseEntity.ok(companies);
    }

    // Get company by ID
    @GetMapping("/{id}")
    public ResponseEntity<Company> getCompanyById(@PathVariable Long id) {
        Optional<Company> company = companyRepository.findById(id);
        return company.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    // Update company by ID
    @PutMapping("/{id}")
    public ResponseEntity<Company> updateCompany(@PathVariable Long id, @RequestBody Company newDetails) {
        Optional<Company> optionalCompany = companyRepository.findById(id);

        if (optionalCompany.isPresent()) {
            Company company = optionalCompany.get();
            company.setName(newDetails.getName());
            company.setEmail(newDetails.getEmail());
            company.setPhone(newDetails.getPhone());
            company.setAddress(newDetails.getAddress());
            return ResponseEntity.ok(companyRepository.save(company));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete company by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCompany(@PathVariable Long id) {
        if (companyRepository.existsById(id)) {
            companyRepository.deleteById(id);
            return ResponseEntity.ok("Company deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Search companies by name with pagination
    @GetMapping("/search")
    public ResponseEntity<Page<Company>> searchCompanies(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Company> result = companyRepository.findByNameContaining(name, pageable);
        return ResponseEntity.ok(result);
    }
}

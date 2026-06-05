package com.iumeatelier.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.iumeatelier.dto.request.CategoryRequest;
import com.iumeatelier.dto.response.CategoryResponse;
import com.iumeatelier.entity.Category;
import com.iumeatelier.exception.BusinessException;
import com.iumeatelier.mapper.CategoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryMapper categoryMapper;

    public List<CategoryResponse> listAll() {
        return categoryMapper.selectList(new LambdaQueryWrapper<Category>().orderByAsc(Category::getName))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CategoryResponse getById(Long id) {
        Category category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException(404, "Category not found");
        }
        return toResponse(category);
    }

    public CategoryResponse create(CategoryRequest request) {
        validateUnique(request.getSlug(), request.getName(), null);
        Category category = new Category();
        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setDescription(request.getDescription());
        categoryMapper.insert(category);
        return toResponse(category);
    }

    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException(404, "Category not found");
        }
        validateUnique(request.getSlug(), request.getName(), id);
        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setDescription(request.getDescription());
        categoryMapper.updateById(category);
        return toResponse(category);
    }

    public void delete(Long id) {
        if (categoryMapper.selectById(id) == null) {
            throw new BusinessException(404, "Category not found");
        }
        categoryMapper.deleteById(id);
    }

    private void validateUnique(String slug, String name, Long excludeId) {
        LambdaQueryWrapper<Category> slugWrapper = new LambdaQueryWrapper<Category>().eq(Category::getSlug, slug);
        LambdaQueryWrapper<Category> nameWrapper = new LambdaQueryWrapper<Category>().eq(Category::getName, name);
        if (excludeId != null) {
            slugWrapper.ne(Category::getId, excludeId);
            nameWrapper.ne(Category::getId, excludeId);
        }
        if (categoryMapper.selectCount(slugWrapper) > 0) {
            throw new BusinessException("Category slug already exists");
        }
        if (categoryMapper.selectCount(nameWrapper) > 0) {
            throw new BusinessException("Category name already exists");
        }
    }

    private CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .createdAt(category.getCreatedAt())
                .build();
    }
}

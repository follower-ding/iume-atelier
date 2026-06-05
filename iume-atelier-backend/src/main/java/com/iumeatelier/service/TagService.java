package com.iumeatelier.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.iumeatelier.dto.request.TagRequest;
import com.iumeatelier.dto.response.TagResponse;
import com.iumeatelier.entity.Tag;
import com.iumeatelier.exception.BusinessException;
import com.iumeatelier.mapper.TagMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagMapper tagMapper;

    public List<TagResponse> listAll() {
        return tagMapper.selectList(new LambdaQueryWrapper<Tag>().orderByAsc(Tag::getName))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public TagResponse getById(Long id) {
        Tag tag = tagMapper.selectById(id);
        if (tag == null) {
            throw new BusinessException(404, "Tag not found");
        }
        return toResponse(tag);
    }

    public TagResponse create(TagRequest request) {
        validateUnique(request.getSlug(), request.getName(), null);
        Tag tag = new Tag();
        tag.setName(request.getName());
        tag.setSlug(request.getSlug());
        tagMapper.insert(tag);
        return toResponse(tag);
    }

    public TagResponse update(Long id, TagRequest request) {
        Tag tag = tagMapper.selectById(id);
        if (tag == null) {
            throw new BusinessException(404, "Tag not found");
        }
        validateUnique(request.getSlug(), request.getName(), id);
        tag.setName(request.getName());
        tag.setSlug(request.getSlug());
        tagMapper.updateById(tag);
        return toResponse(tag);
    }

    public void delete(Long id) {
        if (tagMapper.selectById(id) == null) {
            throw new BusinessException(404, "Tag not found");
        }
        tagMapper.deleteById(id);
    }

    private void validateUnique(String slug, String name, Long excludeId) {
        LambdaQueryWrapper<Tag> slugWrapper = new LambdaQueryWrapper<Tag>().eq(Tag::getSlug, slug);
        LambdaQueryWrapper<Tag> nameWrapper = new LambdaQueryWrapper<Tag>().eq(Tag::getName, name);
        if (excludeId != null) {
            slugWrapper.ne(Tag::getId, excludeId);
            nameWrapper.ne(Tag::getId, excludeId);
        }
        if (tagMapper.selectCount(slugWrapper) > 0) {
            throw new BusinessException("Tag slug already exists");
        }
        if (tagMapper.selectCount(nameWrapper) > 0) {
            throw new BusinessException("Tag name already exists");
        }
    }

    private TagResponse toResponse(Tag tag) {
        return TagResponse.builder()
                .id(tag.getId())
                .name(tag.getName())
                .slug(tag.getSlug())
                .createdAt(tag.getCreatedAt())
                .build();
    }
}

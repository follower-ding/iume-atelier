package com.iumeatelier.mapper;

import com.iumeatelier.entity.SysUser;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserMapper {

  @Select("SELECT * FROM sys_user WHERE username = #{username} AND is_deleted = 0 LIMIT 1")
  SysUser findByUsername(String username);

  @Select("SELECT * FROM sys_user WHERE id = #{id} AND is_deleted = 0 LIMIT 1")
  SysUser findById(Long id);

  @Insert(
      "INSERT INTO sys_user(username, password_hash, nickname, email, role_code) "
          + "VALUES(#{username}, #{passwordHash}, #{nickname}, #{email}, #{roleCode})")
  int insert(SysUser user);
}

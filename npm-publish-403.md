# npm 发布报错 403 Forbidden（2FA）解决方案

**报错信息：**

```
403 Forbidden - Two-factor authentication or granular access token 
with bypass 2fa enabled is required to publish packages.
```

**原因：** npm 要求发布包时必须使用带有 2FA 绕过权限的 token。

---

## 解决步骤

**1. 生成 Granular Access Token**

登录 [npmjs.com](https://www.npmjs.com) → 头像 → Access Tokens → Generate New Token → **Granular Access Token**

填写：
- Token name：随意
- **勾选 `Bypass two-factor authentication (2FA)`** ← 关键
- Packages and scopes → Permissions → **Read and write**
- 点击 Generate token，复制 token

**2. 配置 token**

```sh
npm config set //registry.npmjs.org/:_authToken <你的token>
```

**3. 重新发布**

```sh
npm publish
```

---

> 注意：无论账号是否开启了 2FA，都需要勾选 Bypass 才能正常发布。

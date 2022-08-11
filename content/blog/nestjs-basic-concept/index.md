---
title: NestJs basic concept and example
date: "2021-08-13T12:00:00.000Z"
description: NodeJs 後端套件五花八門，前端有 Vue 及 React 可以做統一，但 NodeJs 的後端呢？如果引入一個統一的架構會不會比較好管理團隊及維護呢？這是前鎮子，墨雨設計的安凱及哲宇所提及的問題，畢竟每個工程師對程式碼也都有各自的想法及理解；而我自己私心的想法是認為，不論在好的框架都要試過了才知道是否能好好地契合整個團隊，於是近期最終宣布使用 NestJs 這個框架來進行專案上的開發，那今天就來介紹我認為這框架的魅力之處。
tags: ["framework", "backend"]
---

### Preface

_本文章，很多範例都是參考此 [Marius Espejo](https://www.youtube.com/channel/UCDpd-qEwAI9wglx4tsEBAtw) 頻道所述及 [官網](https://nestjs.com/)
的介紹。_

比爾・蓋茲曾說過：「我讓懶人做困難的工作，因為懶人能夠找到最簡單的方法完成任務。」；在工程師的世界裡，不會因為你打的程式碼特別長，大家就特別佩服你，我認為好的工程師喜歡將事情簡單化，就從每個工程師都在用的 git 講起，試想當你想 commit git message 時，每次都必須使用下方這個指令：

```bash
git commit -m message
```

如果你可以打個 gc 後面加上你要帶入的資訊就可以將程式碼推上去這不是更快速便捷嗎？有些人或許會說也不過多打幾個字而已，但是如果我將時間拉長為一年呢？事實上，長期下來還是很可觀的，畢竟沒有人喜歡花費太多時間在重複的事情上面。

```bash
gc "add: simple is the best"
```

有鑑於此我做了個 git 的懶人包，也是我平常在做使用的：<br />
(題外話：當我對這次整個修改都很不滿時 `nah`) 😇 😇 😇<br />
(補充：也可以參考這位 Laracasts 的講師 [ANDRE](https://github.com/drehimself/dotfiles/blob/master/.zshrc) 的.zshrc，簡單就是美。)

```bash
alias gs="git status"
alias gl="git log"
alias gll="git log --graph --abbrev-commit --decorate --format=format:'%C(bold blue)%h%C(reset) - %C(bold green)(%ar)%C(reset) %C(white)%s%C(reset) %C(dim white)- %an%C(reset)%C(bold yellow)%d%C(reset)' --all"
alias gaa="git add ."
alias gcom="git checkout master"
alias gc="git commit -m "
alias gp="git push"
alias nah="git reset --hard && git clean -df"
```

### Not making a choice is the best choice

有時候不去做選擇才是最好的選擇，NestJs CLI 就像我上面所撰寫的 alias 範例一樣，它提供許多方便的功能及擴充的套件，簡化重複的事情，方便工程師去使用，在 NodeJs 的世界裡，終於可以不用慢慢一個一個去創建資料夾及檔案了。

```bash
# --------------------------------------------------------------------
# Install NestJs block
# --------------------------------------------------------------------

# install nest globally
npm install -g @nestjs/cli

# initialize project
nest new project-name

# select package manager
yarn or npm

# run project
yarn start:dev

# --------------------------------------------------------------------
# CLI Command block
# --------------------------------------------------------------------

# generate can change to g (shortcut)
nest generate module users
nest g controller users
nest g service users

# using CLI to create whole bunch entity (CRUD), really useful 🔥🔥🔥
nest g resource posts

# step 1: the 5 layers options u can choose
REST API
GraphQL (code first)
GraphQL (schema first)
Microservice (non-HTTP)
WebSockets

# step 2: generate CRUD entity entry points?
Yes or No
```

### Nourishing the document with Swagger

Swagger 滋潤妳空虛的 API 規格文件，有時候相較於開發後端的功能，其實令人頭疼的是該如何將 API 規格整理的完善，有利於下一個開發者撰寫程式碼，甚至是團隊協同合作，NestJs 也都友善的可以進行支援。

```bash
npm i --save @nestjs/swagger swagger-ui-express
```

```typescript
// main.ts
import { NestFactory } from "@nestjs/core"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Initialize Swagger 📚📚📚
  const config = new DocumentBuilder()
    .setTitle("Example API")
    .setDescription("Test API description")
    .setVersion("1.0.0")
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("/dev", app, document)

  await app.listen(3000)
}

bootstrap()
```

```typescript
// users.controller.ts
import { Controller, Get } from "nestjs/common"
import { ApiTags, ApiOkResponse, ApiNotFoundResponse } from "@nestjs/swagger"
import { UsersService } from "./users.service"
import { User } from "./entities/user.entity.ts"

// help Swagger to create API document 📚
@ApiTags("users")
@Controller("users")
export class UserController {
  constructor(private usersService: UsersService) {}

  // help Swagger to create API document 📚
  @ApiOkResponse({
    type: User,
    isArray: true,
    description: "Get the user by ID",
  })
  @ApiNotFoundResponse()
  @Get()
  getUsers(): User[] {
    return this.usersService.findAll()
  }
}
```

### Elegant validation is your best friend

一個合格的後端必須好好驗證前端網站所提供的參數是否符合正確格式，才能將相應的資料寫入資料庫。

```bash
npm i --save class-validator class-transformer
```

```typescript
// main.ts
import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Initialize validation ✅ ✅ ✅
  app.useGlobalPipes(new ValidationPipe())

  await app.listen(3000)
}

bootstrap()
```

```typescript
// dto - Data Transfer Object
// simply think dto is the instance for what data interface should look like 🔥
// update-user.dto.ts file
import { IsAlphanumeric, MaxLength } from "class-validator"

export class UpdateUserDto {
  // validate name column, can combine with swagger ✅
  @IsAlphanumeric()
  @MaxLength(64)
  name: string
}
```

### Success starts with imitation

成功從模仿開始，當學習新的知識，人往往都會去臨摹他人的範本，那下方這個範本可以給你一些簡單的基礎知識；大致上也都可以從這範本進行擴充。

🔥 - 重要知識，你應該要知道 相關 [連結](https://docs.nestjs.com/)<br />
📚 - Swagger 檔案相關 相關 [連結](https://github.com/nestjs/swagger)<br />
✅ - Validation 驗證欄位 相關 [連結](https://docs.nestjs.com/techniques/validation#using-the-built-in-validationpipe)<br />

```typescript
// users.service.ts
import { Injectable } from "nestjs/common"
import { CreateUserDto } from "./dto/create-user.dto.ts"
import { User } from "./entities/user.entity"

@Injectable()
export class UsersService {
  private users: any = [
    { id: 0, name: "Liang" },
    { id: 1, name: "Mayvis" },
    { id: 2, name: "Dana" },
  ]

  findAll(name?: string): User[] {
    if (name) {
      return this.users.filter(user => user.name === name)
    }
    return this.users
  }

  findById(userId: number): User {
    return this.users.find(user => user.id === userId)
  }

  createUser(createUserDto: CreateUserDto): User {
    const newUser = { id: Date.now(), ...createUserDto }

    this.users.push(newUser)

    return newUser
  }
}
```

```typescript
// users.controller.ts
import {
  Controller,
  Get,
  Param,
  Body,
  NotFoundException,
  ParseIntPipe, // useful utility method - parse to int 🔥🔥
  DefaultValuePipe, // useful utility method - default value 🔥🔥
  ParseBoolPipe, // useful utility method - parse to boolean 🔥🔥
} from "nestjs/common"
import {
  ApiTags,
  ApiCreateResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from "@nestjs/swagger"
import { UsersService } from "./users.service"
import { User } from "./entities/user.entity.ts"
import { CreateUserDto } from "./dto/create-user.dto.ts"

// help Swagger to create API document 📚
@ApiTags("users")
@Controller("users")
export class UserController {
  constructor(private usersService: UsersService) {}

  // help Swagger to create API document 📚
  @ApiOkResponse({ type: User, isArray: true })
  @Get()
  getUsers(): User[] {
    return this.usersService.findAll()
  }

  // nestjs query example 🔥
  // help Swagger to create API document 📚
  @ApiOkResponse({ type: User, isArray: true })
  @ApiQuery({ name: "name", required: false })
  @Get()
  getUserByQueryName(@Query("name") name: string) {
    return this.usersService.findAll(name)
  }

  // help Swagger to create API document, and handle error 📚
  @ApiOkResponse({ type: User, description: "Get the user by ID" })
  @ApiNotFoundResponse()
  @Get(":id")
  getUserById(@Param("id", ParseIntPipe) id: number): User {
    const user = this.usersService.findById(id)

    // nestjs handle error, in this case 404 🔥
    if (!user) {
      throw new NotFoundException()
    }

    return user
  }

  // help Swagger to create API document 📚
  @ApiCreateResponse({ type: User })
  @ApiBadRequestResponse()
  @Post()
  createUser(@Body() body: CreateUserDto): User {
    return this.usersService.createUser(body)
  }
}
```

```typescript
// dto - Data Transfer Object
// simply think dto is the instance for what data interface should look like 🔥
// src/users/dto/create-user.dto.ts
import { ApiProperty } from "@nestjs/swagger"

export class CreateUserDto {
  // help Swagger to create API document 📚
  @ApiProperty()
  name: string

  // swagger doc optional field 📚
  // @ApiProperty({ required: false })
  // age?: number;
}
```

```typescript
// simply think entity is database table 🔥
// src/users/entities/user.entity.ts
import { ApiProperty } from "@nestjs/swagger"

export class User {
  // help Swagger to create API document 📚
  @ApiProperty()
  id: number

  @ApiProperty()
  name: string
}
```

### Conclusion

結尾，像是 ORM 的使用及 Testing 我就沒有特別寫上去了，因為官網有提供相當完整的文檔，那 ORM 也比較複雜，建議好好的將文檔看完；其實因為在幾年前有用 Laravel 來進行網站的開發，雖然不知道為什麼漸漸的不去使用了，可能是因為現在公司主要是在做人工智慧的關係吧，需要較高的效能，大多使用 golang, java...等。

那我自己在看 NestJs 時，其實特別的親切，儘管功能沒有 Laravel 這 PHP 怪物框架那麼的友善，但是也算是簡潔易懂的，尤其是做像是 TDD (Test Driven Development) 時，有種回到 Laravel 的感覺，算是意外的驚喜吧！

下面幾個重點跟各位分享：

1. 可以多多使用 NestJs 便捷 Pipe method 及 Error exception。
2. 強烈建議與 Swagger 進行搭配，還是要為下一個接你程式碼的工程師設想一下。
3. ORM 的部分可以根據專案大小來做使用，個人覺得這點相對 Laravel 是有優勢的，程式碼不會太過臃腫。
4. TDD 是你的好朋友，可以讓你比較不容易犯錯。
5. [Marius Espejo](https://www.youtube.com/channel/UCDpd-qEwAI9wglx4tsEBAtw) 英文如果不錯，可以去看看，會有所收穫。

那我們就下一篇再見啦！！

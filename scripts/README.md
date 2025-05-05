# Скрипты генерации данных

## 1. Создание пользователя

```bash
node scripts/create-user.mjs email password name role
```
- email — email пользователя (по умолчанию user@example.com)
- password — пароль (по умолчанию password)
- name — имя пользователя (по умолчанию 'Имя пользователя')
- role — роль (по умолчанию 1)

Пример:
```bash
node scripts/create-user.mjs admin@example.com 123456 Админ 3
```npm 

---

## 2. Создание классов

```bash
node scripts/create-classes.mjs
```
Создаёт несколько классов (можно изменить массив в скрипте).

---

## 3. Создание события в календаре

```bash
node scripts/create-calendar-event.mjs "Название" "Описание" "2024-06-01"
```
- Название — название события (по умолчанию 'Мероприятие')
- Описание — описание события (по умолчанию 'Описание мероприятия')
- Дата — дата события в формате YYYY-MM-DD (по умолчанию сегодня)

Пример:
```bash
node scripts/create-calendar-event.mjs "День знаний" "Торжественная линейка" "2024-09-01"
``` 